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

    // Pasada 1: detectar layout libremente y emparejar nombre ↔ precio.
    const pass1System = `You extract restaurant menus from photos of printed or digital menus.
Menus use MANY different designs. Do NOT assume one fixed layout.

STEP A — Understand the layout of THIS photo first:
- 1 column or several columns
- Name and price on the same line (price left or right)
- Name, then description, then price stacked vertically (often centered)
- Price above the name, or under a dotted leader line
- Cards/boxes per dish, chalkboards, handwritten, bilingual lines, etc.
Adapt your reading order to the actual layout (usually top→bottom; if multiple columns, finish one column before the next, or follow reading order of that design).

STEP B — Extract every dish you can read with high fidelity.

PAIRING RULES (layout-agnostic):
1. Each dish is a visual block: typically NAME + optional DESCRIPTION + one or more PRICES.
2. Assign each price to the dish whose block it belongs to — never steal a price from a neighboring dish or another column/box.
3. Prefer the dish TITLE (usually larger/bolder) over smaller description/ingredient text.
4. Descriptions are NOT dish names and do NOT own the price.
5. Section headers group dishes (ENTRANTES, PRIMERS, POSTRES, RACIONES, Drinks…). If unclear, use a sensible section name or "General".
6. Ignore logos, photos, QR codes, allergens icons alone, promo banners, page footers, addresses, and decorative captions that are not dishes.
7. Prices: European "7,45€" → amount 7.45. "$12.50" → 12.50. Keep €→EUR, $→USD when visible; else use defaultCurrency.
8. Multiple prices for one dish (tapa / ración, half / full, sizes): put them all in "prices" with a short "label" when the menu shows one.
9. For each item set "namePriceEvidence": a short quote of how name and price appear together in the photo (same line OR stacked). Examples:
   - "Patatas bravas ………… 7,45€"
   - "Patatas bravas / Con alioli / 7,45€" (vertical stack)
10. "amount" MUST match the number in namePriceEvidence. If a price is unreadable, omit that item and add a warning — do not invent prices.
11. Set confidence "high" | "medium" | "low" based on how clear the pairing is.

Return JSON only:
{
  "layoutSummary": "one short sentence describing the layout you detected",
  "sections": [
    {
      "name": "RACIONES",
      "items": [
        {
          "name": "Patatas bravas o mixtas",
          "namePriceEvidence": "Patatas bravas o mixtas 7,45€",
          "prices": [{ "currency": "EUR", "label": null, "amount": 7.45 }],
          "confidence": "high"
        }
      ]
    }
  ],
  "warnings": []
}`;

    const pass1User = `defaultCurrency=${currencyCode}. Page ${pageIndex}/${pageCount}.
First infer this menu's layout, then extract EVERY section → dish name → price(s). No descriptions in this pass.
Maximize accuracy so a human needs few or no corrections. Respond with JSON only.`;

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
          prices: it.prices,
        })),
      }));

      const pass2System = `You add descriptions to an already extracted restaurant menu from a photo.
The name↔price pairs are LOCKED and correct. Do NOT change names, amounts, currencies, labels, section order, or item order.
For each dish, copy VERBATIM the descriptive / ingredient text that belongs to that dish in the photo (often under the name, sometimes beside it, sometimes in a smaller font). If there is none, use "".
Adapt to ANY layout (columns, stacked centered blocks, cards, etc.).
Ignore logos, photos, icons, and promo banners.
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

    const layoutSummary =
      pass1Raw &&
      typeof pass1Raw === 'object' &&
      typeof (pass1Raw as Record<string, unknown>).layoutSummary === 'string'
        ? String((pass1Raw as Record<string, unknown>).layoutSummary).trim()
        : '';
    if (layoutSummary) {
      preview.warnings.unshift(`Layout detectado: ${layoutSummary}`);
    }
    preview.warnings.unshift(
      'Revisá la vista previa: el análisis se adapta al diseño de la foto, pero conviene verificar precios y textos.',
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

  /** Extrae número desde evidencia nombre↔precio si el modelo se contradice. */
  private amountFromNamePriceLine(line: string | null | undefined): number | null {
    if (!line) return null;
    const matches = line.match(/(\d{1,3}(?:[.,]\d{3})*[.,]\d{1,2}|\d+[.,]\d{1,2}|\d+)(?=\s*€|\s*$|\/|\|)/g);
    if (!matches?.length) {
      // Fallback: último número con decimales en la cadena
      const any = line.match(/(\d{1,3}(?:[.,]\d{3})*[.,]\d{1,2}|\d+[.,]\d{1,2}|\d+)/g);
      if (!any?.length) return null;
      return this.parseAmount(any[any.length - 1]);
    }
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
          typeof item.namePriceEvidence === 'string' && item.namePriceEvidence.trim()
            ? item.namePriceEvidence.trim()
            : typeof item.namePriceLine === 'string'
              ? item.namePriceLine.trim()
              : '';
        const lineAmount = this.amountFromNamePriceLine(namePriceLine);
        const evidenceCurrency = namePriceLine.includes('€')
          ? 'EUR'
          : /\$|USD/i.test(namePriceLine)
            ? 'USD'
            : null;

        const prices: MenuPhotoPreviewPrice[] = [];
        const pricesRaw = Array.isArray(item.prices) ? item.prices : [];
        const useEvidenceAsAuthority = pricesRaw.length <= 1;
        for (const p of pricesRaw) {
          if (!p || typeof p !== 'object') continue;
          const pr = p as Record<string, unknown>;
          let amount = this.parseAmount(pr.amount);
          // Con un solo precio, la evidencia nombre↔precio manda si hay contradicción
          if (
            useEvidenceAsAuthority &&
            lineAmount !== null &&
            amount !== null &&
            Math.abs(lineAmount - amount) > 0.001
          ) {
            warnings.push(
              `"${itemName}": precio del JSON (${amount}) no coincide con la evidencia ("${namePriceLine}"); se usó ${lineAmount}.`,
            );
            amount = lineAmount;
          } else if (useEvidenceAsAuthority && amount === null && lineAmount !== null) {
            amount = lineAmount;
          }
          if (amount === null) continue;
          let cur = String(pr.currency || currency).trim().toUpperCase() || currency;
          if (cur === 'EURO' || cur === 'EUROS' || cur === '€') cur = 'EUR';
          if (evidenceCurrency) cur = evidenceCurrency;
          const label = String(pr.label || '').trim();
          prices.push({
            currency: cur,
            label: label || null,
            amount,
          });
        }

        if (!prices.length && lineAmount !== null) {
          prices.push({
            currency: evidenceCurrency || currency,
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
