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
    return m || 'gpt-4o-mini';
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
    const imageParts = files.map((f) => {
      const mime = (f.mimetype || 'image/jpeg').split(';')[0] || 'image/jpeg';
      const b64 = f.buffer.toString('base64');
      return {
        type: 'image_url' as const,
        image_url: {
          url: `data:${mime};base64,${b64}`,
          detail: 'high' as const,
        },
      };
    });

    const systemPrompt = `You are an expert at reading printed restaurant menus from photos.
Extract the menu structure as JSON only. Do not invent products that are not visible.
Ignore decorative logos, QR codes, and social media handles.
Do not extract or invent product photos — text and prices only.
If a price currency is unclear on paper, use the provided default currency.
Amounts must be positive numbers (use decimal point).
Return JSON with this exact shape:
{
  "sections": [
    {
      "name": "string",
      "items": [
        {
          "name": "string",
          "description": "string or empty",
          "prices": [{ "currency": "ISO4217", "label": "optional size/label or empty", "amount": number }],
          "confidence": "high|medium|low"
        }
      ]
    }
  ],
  "warnings": ["string"]
}
Section titles are category headers (Entradas, Principales, etc.). Items are dishes.
If multiple pages show the same section name, merge items under one section preserving order.
If a price is illegible, omit that item from results and add a warning.`;

    const userText = `Default currency code for prices when not explicit on the menu: ${currencyCode}.
Analyze all attached page photos as one multi-page printed menu.
Respond with JSON only.`;

    const body = {
      model: this.getModel(),
      response_format: { type: 'json_object' },
      temperature: 0.1,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [{ type: 'text', text: userText }, ...imageParts],
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
          const amount = Number(pr.amount);
          if (!Number.isFinite(amount) || amount <= 0) continue;
          const cur = String(pr.currency || currency).trim().toUpperCase() || currency;
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
        target.items.push({
          name: itemName,
          description: String(item.description || '').trim() || null,
          prices,
          confidence:
            typeof item.confidence === 'string' ? item.confidence.trim().toLowerCase() : null,
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
