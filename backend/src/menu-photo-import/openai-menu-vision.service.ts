import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type MenuPhotoPreviewPrice = {
  currency: string;
  label?: string | null;
  amount: number;
};

export type MenuPhotoPreviewItem = {
  name: string;
  description?: string | null;
  prices: MenuPhotoPreviewPrice[];
  confidence?: string | null;
};

export type MenuPhotoPreviewSection = {
  name: string;
  items: MenuPhotoPreviewItem[];
};

export type MenuPhotoPreview = {
  sections: MenuPhotoPreviewSection[];
  warnings: string[];
};

type ChatContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string; detail: 'high' | 'low' | 'auto' } };

@Injectable()
export class OpenAiMenuVisionService {
  private readonly logger = new Logger(OpenAiMenuVisionService.name);

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.getApiKey());
  }

  private getApiKey(): string {
    return String(this.config.get<string>('OPENAI_API_KEY') || '').trim();
  }

  private getDefaultModel(): string {
    const m = String(this.config.get<string>('OPENAI_MODEL') || '').trim();
    return m || 'gpt-4o';
  }

  /** Modelos permitidos desde la herramienta SA. */
  resolveModel(requested?: string | null): string {
    const raw = String(requested || '').trim().toLowerCase();
    if (raw === 'gpt-4o-mini' || raw === 'mini') return 'gpt-4o-mini';
    if (raw === 'gpt-4o' || raw === 'common' || raw === 'standard') return 'gpt-4o';
    return this.getDefaultModel();
  }

  private getBaseUrl(): string {
    const base = String(this.config.get<string>('OPENAI_BASE_URL') || '').trim();
    return (base || 'https://api.openai.com/v1').replace(/\/$/, '');
  }

  async analyzeMenuImages(
    files: Array<{ buffer: Buffer; mimetype: string; originalname?: string }>,
    currency: string,
    model?: string | null,
  ): Promise<MenuPhotoPreview> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'OpenAI no está configurado. Definí OPENAI_API_KEY en el entorno del backend.',
      );
    }
    if (!files?.length) {
      throw new BadGatewayException('Se requiere al menos una imagen del menú');
    }

    const currencyCode = currency.trim().toUpperCase() || 'USD';
    const resolvedModel = this.resolveModel(model);

    const pagePreviews: MenuPhotoPreview[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      pagePreviews.push(
        await this.analyzeSinglePage(file, currencyCode, i + 1, files.length, resolvedModel),
      );
    }

    return this.mergePagePreviews(pagePreviews, currencyCode);
  }

  private async analyzeSinglePage(
    file: { buffer: Buffer; mimetype: string; originalname?: string },
    currencyCode: string,
    pageIndex: number,
    pageCount: number,
    model: string,
  ): Promise<MenuPhotoPreview> {
    const mime = (file.mimetype || 'image/jpeg').split(';')[0] || 'image/jpeg';
    const imageUrl = `data:${mime};base64,${file.buffer.toString('base64')}`;
    const imagePart: ChatContentPart = {
      type: 'image_url',
      image_url: { url: imageUrl, detail: 'high' },
    };

    // Pasada 1: SOLO nombre ↔ precio (misma línea). Evita que la descripción desplace el precio.
    const pass1System = `You read printed European restaurant menus from photos.
Your ONLY job is to pair each DISH NAME with the PRICE printed on the SAME horizontal line (usually right-aligned).

STRICT RULES:
1. Work COLUMN BY COLUMN (left to right), top to bottom within each column. Never take a price from another column.
2. The price belongs to the BOLD dish title on that same line — NOT to the smaller description lines below.
3. Multi-line descriptions do NOT move the price. Ignore description text completely in this pass.
4. Ignore photos, logos, icons (red L, smileys), sauce banners ("añade tu salsa…"), and image captions.
5. Section headers are short titles in colored bars (RACIONES, ESPECIALIDADES, POSTRES, HUEVOS ROTOS XL…).
6. European prices: 7,45€ → amount 7.45. Keep € as EUR; otherwise use defaultCurrency.
7. For each item include namePriceLine: the dish name AND the price digits exactly as you see them on that title line (example: "Patatas bravas o mixtas 7,45€").
8. amount MUST match the number in namePriceLine. If you cannot read the price on the name line, omit the item and warn.

Return JSON only:
{
  "sections": [
    {
      "name": "RACIONES",
      "items": [
        {
          "name": "Patatas bravas o mixtas",
          "namePriceLine": "Patatas bravas o mixtas 7,45€",
          "prices": [{ "currency": "EUR", "amount": 7.45 }],
          "confidence": "high"
        }
      ]
    }
  ],
  "warnings": []
}`;

    const pass1User = `defaultCurrency=${currencyCode}. Page ${pageIndex}/${pageCount}.
Extract ONLY section → dish name → price pairs. No descriptions.
Respond with JSON only.`;

    const pass1Raw = await this.chatJson(model, pass1System, [
      { type: 'text', text: pass1User },
      imagePart,
    ]);
    let preview = this.normalizePreview(pass1Raw, currencyCode, { requirePrices: true });

    // Pasada 2: descripciones sin tocar precios ya fijados.
    if (preview.sections.length) {
      const locked = preview.sections.map((s) => ({
        name: s.name,
        items: s.items.map((it) => ({
          name: it.name,
          amount: it.prices[0]?.amount,
          currency: it.prices[0]?.currency,
        })),
      }));

      const pass2System = `You add descriptions to an already extracted restaurant menu.
The name↔price pairs are LOCKED and correct. Do NOT change names, amounts, currencies, section order, or item order.
For each dish, copy VERBATIM the smaller text printed directly under its name (ingredients/accompaniment). If none, use "".
Ignore photos, icons, and promo banners.
Return JSON with the same sections/items, adding only "description".`;

      const pass2User = `Locked menu JSON (do not alter prices/names):
${JSON.stringify({ sections: locked })}

Look at the photo and fill description for each item. Respond with JSON only:
{ "sections": [ { "name": "...", "items": [ { "name": "...", "description": "...", "prices": [{ "currency": "...", "amount": 0 }], "confidence": "high" } ] } ], "warnings": [] }
Keep the same prices/amounts from the locked JSON.`;

      try {
        const pass2Raw = await this.chatJson(model, pass2System, [
          { type: 'text', text: pass2User },
          imagePart,
        ]);
        preview = this.mergeDescriptions(preview, this.normalizePreview(pass2Raw, currencyCode));
      } catch (e) {
        this.logger.warn(`Pass 2 (descriptions) failed; keeping prices from pass 1: ${e}`);
        preview.warnings.push(
          'No se pudieron completar todas las descripciones; revisá precios (sí se extrajeron) y textos a mano.',
        );
      }
    }

    preview.warnings.unshift(
      'Revisá precios en la vista previa: se extrajeron emparejando nombre y precio de la misma línea.',
    );
    return preview;
  }

  private async chatJson(
    model: string,
    systemPrompt: string,
    userContent: ChatContentPart[],
  ): Promise<unknown> {
    const body = {
      model,
      response_format: { type: 'json_object' },
      temperature: 0,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    };

    let response: Response;
    try {
      response = await fetch(`${this.getBaseUrl()}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.getApiKey()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    } catch (e: any) {
      this.logger.error(`OpenAI network error: ${e?.message || e}`);
      throw new BadGatewayException('No se pudo contactar a OpenAI para analizar las fotos');
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      this.logger.error(`OpenAI HTTP ${response.status}: ${errText.slice(0, 500)}`);
      let openaiType = '';
      let openaiMessage = '';
      try {
        const parsedErr = JSON.parse(errText) as {
          error?: { type?: string; message?: string; code?: string };
        };
        openaiType = String(parsedErr?.error?.type || parsedErr?.error?.code || '');
        openaiMessage = String(parsedErr?.error?.message || '');
      } catch {
        /* ignore */
      }
      if (response.status === 429 && /insufficient_quota/i.test(openaiType + openaiMessage)) {
        throw new BadGatewayException(
          'OpenAI sin crédito/cuota disponible. Revisá billing en https://platform.openai.com/account/billing (el plan gratuito o la clave nueva pueden no tener saldo).',
        );
      }
      if (response.status === 429) {
        throw new BadGatewayException(
          'OpenAI limitó temporalmente las peticiones (rate limit). Esperá un momento y reintentá.',
        );
      }
      if (response.status === 401) {
        throw new BadGatewayException(
          'OpenAI rechazó la API key (401). Verificá OPENAI_API_KEY en el entorno del backend.',
        );
      }
      throw new BadGatewayException(
        `OpenAI rechazó el análisis (HTTP ${response.status}). Revisá la clave, el modelo y el tamaño de las imágenes.`,
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new BadGatewayException('OpenAI no devolvió contenido usable');
    }

    try {
      return JSON.parse(content);
    } catch {
      throw new BadGatewayException('OpenAI devolvió JSON inválido');
    }
  }

  /** Conserva precios de pass1; solo copia descripciones de pass2 por nombre. */
  private mergeDescriptions(base: MenuPhotoPreview, withDesc: MenuPhotoPreview): MenuPhotoPreview {
    const descByKey = new Map<string, string>();
    for (const sec of withDesc.sections) {
      for (const it of sec.items) {
        const key = `${sec.name.toLowerCase()}::${it.name.toLowerCase()}`;
        if (it.description) descByKey.set(key, it.description);
      }
    }
    return {
      warnings: [...base.warnings, ...withDesc.warnings.filter((w) => !base.warnings.includes(w))],
      sections: base.sections.map((sec) => ({
        ...sec,
        items: sec.items.map((it) => {
          const key = `${sec.name.toLowerCase()}::${it.name.toLowerCase()}`;
          const description = descByKey.get(key) ?? it.description ?? null;
          return { ...it, description };
        }),
      })),
    };
  }

  private mergePagePreviews(pages: MenuPhotoPreview[], currencyCode: string): MenuPhotoPreview {
    const warnings: string[] = [];
    for (const p of pages) {
      warnings.push(...(p.warnings || []));
    }
    return this.normalizePreview(
      { sections: pages.flatMap((p) => p.sections), warnings },
      currencyCode,
    );
  }

  private parseAmount(raw: unknown): number | null {
    if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw;
    if (typeof raw !== 'string') return null;
    let t = raw.trim().replace(/\s/g, '').replace(/[€$]/g, '');
    if (/^\d{1,3}(\.\d{3})*,\d{1,2}$/.test(t)) {
      t = t.replace(/\./g, '').replace(',', '.');
    } else if (t.includes(',') && !t.includes('.')) {
      t = t.replace(',', '.');
    }
    const n = Number(t);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  }

  /** Extrae número desde namePriceLine si el modelo se contradice. */
  private amountFromNamePriceLine(line: string | null | undefined): number | null {
    if (!line) return null;
    const matches = line.match(/(\d{1,3}(?:[.,]\d{3})*[.,]\d{1,2}|\d+[.,]\d{1,2}|\d+)(?=\s*€|\s*$)/g);
    if (!matches?.length) return null;
    return this.parseAmount(matches[matches.length - 1]);
  }

  normalizePreview(
    raw: unknown,
    defaultCurrency: string,
    opts?: { requirePrices?: boolean },
  ): MenuPhotoPreview {
    const currency = defaultCurrency.toUpperCase();
    const warnings: string[] = [];
    const obj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
    if (Array.isArray(obj.warnings)) {
      for (const w of obj.warnings) {
        if (typeof w === 'string' && w.trim()) warnings.push(w.trim());
      }
    }

    const sectionsRaw = Array.isArray(obj.sections) ? obj.sections : [];
    const sectionMap = new Map<string, MenuPhotoPreviewSection>();
    const sectionOrder: string[] = [];

    for (const sec of sectionsRaw) {
      if (!sec || typeof sec !== 'object') continue;
      const s = sec as Record<string, unknown>;
      const name = String(s.name || '').trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (!sectionMap.has(key)) {
        sectionMap.set(key, { name, items: [] });
        sectionOrder.push(key);
      }
      const target = sectionMap.get(key)!;
      const itemsRaw = Array.isArray(s.items) ? s.items : [];
      for (const it of itemsRaw) {
        if (!it || typeof it !== 'object') continue;
        const item = it as Record<string, unknown>;
        const itemName = String(item.name || '').trim();
        if (!itemName) continue;

        const namePriceLine =
          typeof item.namePriceLine === 'string' ? item.namePriceLine.trim() : '';
        const lineAmount = this.amountFromNamePriceLine(namePriceLine);

        const prices: MenuPhotoPreviewPrice[] = [];
        const pricesRaw = Array.isArray(item.prices) ? item.prices : [];
        for (const p of pricesRaw) {
          if (!p || typeof p !== 'object') continue;
          const pr = p as Record<string, unknown>;
          let amount = this.parseAmount(pr.amount);
          // Si namePriceLine tiene otro número, confiar en la línea (más fiable en multi-columna)
          if (lineAmount !== null && amount !== null && Math.abs(lineAmount - amount) > 0.001) {
            warnings.push(
              `"${itemName}": precio del JSON (${amount}) no coincide con la línea ("${namePriceLine}"); se usó ${lineAmount}.`,
            );
            amount = lineAmount;
          } else if (amount === null && lineAmount !== null) {
            amount = lineAmount;
          }
          if (amount === null) continue;
          let cur = String(pr.currency || currency).trim().toUpperCase() || currency;
          if (cur === 'EURO' || cur === 'EUROS' || cur === '€') cur = 'EUR';
          if (namePriceLine.includes('€')) cur = 'EUR';
          const label = String(pr.label || '').trim();
          prices.push({
            currency: cur,
            label: label || null,
            amount,
          });
        }

        if (!prices.length && lineAmount !== null) {
          prices.push({
            currency: namePriceLine.includes('€') ? 'EUR' : currency,
            label: null,
            amount: lineAmount,
          });
        }

        if (!prices.length) {
          if (opts?.requirePrices !== false) {
            warnings.push(`Producto "${itemName}" sin precio legible; omitido del preview.`);
          }
          continue;
        }

        const confidence =
          typeof item.confidence === 'string' ? item.confidence.trim().toLowerCase() : null;
        if (confidence === 'low') {
          warnings.push(
            `Revisá precio de "${itemName}" (confianza baja del análisis).`,
          );
        }

        target.items.push({
          name: itemName,
          description: String(item.description || '').trim() || null,
          prices,
          confidence,
        });
      }
    }

    const sections = sectionOrder
      .map((k) => sectionMap.get(k)!)
      .filter((s) => s.items.length > 0);

    if (!sections.length) {
      warnings.push('No se detectaron productos con precio en las fotos. Revisá nitidez e iluminación.');
    }

    return { sections, warnings };
  }
}
