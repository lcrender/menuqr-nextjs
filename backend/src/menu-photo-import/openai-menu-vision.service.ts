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

  private getModel(): string {
    const m = String(this.config.get<string>('OPENAI_MODEL') || '').trim();
    // gpt-4o reads multi-column menus much more reliably than mini
    return m || 'gpt-4o';
  }

  private getBaseUrl(): string {
    const base = String(this.config.get<string>('OPENAI_BASE_URL') || '').trim();
    return (base || 'https://api.openai.com/v1').replace(/\/$/, '');
  }

  async analyzeMenuImages(
    files: Array<{ buffer: Buffer; mimetype: string; originalname?: string }>,
    currency: string,
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

    // Una página por llamada reduce confusiones en cartas multi-columna; luego mergeamos.
    const pagePreviews: MenuPhotoPreview[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      pagePreviews.push(await this.analyzeSinglePage(file, currencyCode, i + 1, files.length));
    }

    return this.mergePagePreviews(pagePreviews, currencyCode);
  }

  private async analyzeSinglePage(
    file: { buffer: Buffer; mimetype: string; originalname?: string },
    currencyCode: string,
    pageIndex: number,
    pageCount: number,
  ): Promise<MenuPhotoPreview> {
    const mime = (file.mimetype || 'image/jpeg').split(';')[0] || 'image/jpeg';
    const b64 = file.buffer.toString('base64');

    const systemPrompt = `You extract printed restaurant menus from photos into JSON. Accuracy of name↔price pairing is critical.

LAYOUT RULES (Spanish / European menus):
1. Multi-column layouts are common (e.g. RACIONES | HUEVOS | ESPECIALIDADES | POSTRES). Read EACH column top-to-bottom independently. Never mix a price from one column with an item in another.
2. For each dish, the PRICE sits on the SAME horizontal line as the DISH NAME (usually bold), right-aligned. The description is ONLY the smaller text directly under that name — NEVER under the next dish.
3. NEVER assign a price from the dish above or below. If a description is multi-line, the price still belongs to the name on the first line of that block, not to the last description line.
4. Copy names and descriptions VERBATIM from the photo. Do not paraphrase, shorten, translate, or invent ingredients.
5. Ignore: food photos, logos, QR codes, decorative icons (red L, smiley faces), sauce upsell banners (e.g. "añade tu salsa…"), photo captions on images.
6. Section headers are short titles in colored bars (RACIONES, ESPECIALIDADES, POSTRES, HUEVOS ROTOS XL, etc.).
7. Prices like 7,45€ or 7.45€ → amount 7.45 with decimal POINT. Currency EUR if € is shown, else use the default currency provided.
8. If unsure about a price↔name pair, set confidence to "low" and add a warning; do not guess.

Return JSON only:
{
  "sections": [
    {
      "name": "string",
      "items": [
        {
          "name": "string",
          "description": "verbatim text or empty string",
          "prices": [{ "currency": "EUR", "label": "", "amount": 7.45 }],
          "confidence": "high|medium|low"
        }
      ]
    }
  ],
  "warnings": ["string"]
}`;

    const userText = `Default currency if no symbol on paper: ${currencyCode}.
This is page ${pageIndex} of ${pageCount} of a printed menu photo.
First identify columns and section headers, then extract dishes column by column.
For every item, double-check that the price is the one printed on the same line as that item's name.
Respond with JSON only.`;

    const body = {
      model: this.getModel(),
      response_format: { type: 'json_object' },
      temperature: 0,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: userText },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mime};base64,${b64}`,
                detail: 'high' as const,
              },
            },
          ],
        },
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

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new BadGatewayException('OpenAI devolvió JSON inválido');
    }

    return this.normalizePreview(parsed, currencyCode);
  }

  private mergePagePreviews(pages: MenuPhotoPreview[], currencyCode: string): MenuPhotoPreview {
    const warnings: string[] = [];
    for (const p of pages) {
      warnings.push(...(p.warnings || []));
    }
    const merged = {
      sections: pages.flatMap((p) => p.sections),
      warnings,
    };
    // Re-normalize to merge same section names across pages
    return this.normalizePreview(merged, currencyCode);
  }

  private parseAmount(raw: unknown): number | null {
    if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw;
    if (typeof raw !== 'string') return null;
    let t = raw.trim().replace(/\s/g, '').replace(/[€$]/g, '');
    // 7,45 or 1.234,56 (EU) vs 7.45 (US)
    if (/^\d{1,3}(\.\d{3})*,\d{1,2}$/.test(t)) {
      t = t.replace(/\./g, '').replace(',', '.');
    } else if (t.includes(',') && !t.includes('.')) {
      t = t.replace(',', '.');
    }
    const n = Number(t);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  }

  normalizePreview(raw: unknown, defaultCurrency: string): MenuPhotoPreview {
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
        const prices: MenuPhotoPreviewPrice[] = [];
        const pricesRaw = Array.isArray(item.prices) ? item.prices : [];
        for (const p of pricesRaw) {
          if (!p || typeof p !== 'object') continue;
          const pr = p as Record<string, unknown>;
          const amount = this.parseAmount(pr.amount);
          if (amount === null) continue;
          let cur = String(pr.currency || currency).trim().toUpperCase() || currency;
          if (cur === 'EURO' || cur === 'EUROS') cur = 'EUR';
          const label = String(pr.label || '').trim();
          prices.push({
            currency: cur,
            label: label || null,
            amount,
          });
        }
        if (!prices.length) {
          warnings.push(`Producto "${itemName}" sin precio legible; omitido del preview.`);
          continue;
        }
        const confidence =
          typeof item.confidence === 'string' ? item.confidence.trim().toLowerCase() : null;
        if (confidence === 'low') {
          warnings.push(
            `Revisá precio/descripción de "${itemName}" (confianza baja del análisis).`,
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
