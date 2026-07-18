import { BadRequestException, Injectable } from '@nestjs/common';
import {
  MenusCsvImportService,
  StructuredMenuImportRow,
} from '../menus/menus-csv-import.service';
import { ImportMenuFromPhotoDto } from './dto/import-menu-from-photo.dto';
import { OpenAiMenuVisionService } from './openai-menu-vision.service';

@Injectable()
export class MenuPhotoImportService {
  constructor(
    private readonly vision: OpenAiMenuVisionService,
    private readonly menusCsvImport: MenusCsvImportService,
  ) {}

  async previewFromImages(files: Express.Multer.File[], currency: string) {
    return this.vision.analyzeMenuImages(
      files.map((f) => ({
        buffer: f.buffer,
        mimetype: f.mimetype,
        originalname: f.originalname,
      })),
      currency,
    );
  }

  async importFromPreview(dto: ImportMenuFromPhotoDto) {
    const currency = dto.currency.trim().toUpperCase();
    if (!currency) {
      throw new BadRequestException('currency es requerido');
    }
    if (!dto.preview?.sections?.length) {
      throw new BadRequestException('El preview no tiene secciones');
    }

    const rows: StructuredMenuImportRow[] = [];
    for (const section of dto.preview.sections) {
      const sectionName = section.name.trim();
      if (!sectionName) continue;
      for (const item of section.items) {
        const name = item.name.trim();
        if (!name) continue;
        const prices = (item.prices || []).filter((p) => Number(p.amount) > 0);
        if (!prices.length) {
          throw new BadRequestException(`Producto "${name}" necesita al menos un precio > 0`);
        }
        const row: StructuredMenuImportRow = {
          nombre_seccion: sectionName,
          nombre_producto: name,
          descripcion_producto: (item.description || '').trim() || undefined,
        };
        prices.slice(0, 5).forEach((p, idx) => {
          const i = idx + 1;
          (row as any)[`moneda_${i}`] = (p.currency || currency).trim().toUpperCase() || currency;
          (row as any)[`precio_${i}`] = String(p.amount);
          const label = (p.label || '').trim();
          if (label) (row as any)[`etiqueta_${i}`] = label;
        });
        rows.push(row);
      }
    }

    if (!rows.length) {
      throw new BadRequestException('No hay productos válidos en el preview');
    }

    return this.menusCsvImport.importStructuredMenu(
      dto.tenantId,
      dto.restaurantId,
      {
        menuName: dto.menuName,
        menuDescription: dto.menuDescription,
      },
      rows,
      Array.isArray(dto.preview.warnings) ? dto.preview.warnings : [],
    );
  }
}
