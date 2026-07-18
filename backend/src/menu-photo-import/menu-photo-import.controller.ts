import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { ImportMenuFromPhotoDto } from './dto/import-menu-from-photo.dto';
import { MenuPhotoImportService } from './menu-photo-import.service';

@ApiTags('admin-tools-menu-photo')
@Controller('admin/tools/menu-photo')
@ApiBearerAuth()
@Roles('SUPER_ADMIN')
export class MenuPhotoImportController {
  constructor(private readonly menuPhotoImport: MenuPhotoImportService) {}

  @Post('preview')
  @ApiOperation({ summary: 'Analizar fotos de menú impreso (OpenAI Vision)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files', 'currency'],
      properties: {
        currency: { type: 'string', example: 'ARS' },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 8, {
      limits: { fileSize: 3 * 1024 * 1024 },
    }),
  )
  async preview(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('currency') currency: string,
  ) {
    if (!files?.length) {
      throw new BadRequestException('Subí al menos una foto del menú (campo multipart "files")');
    }
    if (!currency?.trim()) {
      throw new BadRequestException('currency es requerido');
    }
    for (const f of files) {
      if (!f?.buffer?.length) {
        throw new BadRequestException('Una de las imágenes llegó vacía');
      }
      const mime = (f.mimetype || '').toLowerCase();
      if (!mime.startsWith('image/')) {
        throw new BadRequestException(`Archivo no es imagen: ${f.originalname || mime}`);
      }
    }
    return this.menuPhotoImport.previewFromImages(files, currency.trim());
  }

  @Post('import')
  @ApiOperation({ summary: 'Persistir menú desde preview editado (sin fotos de productos)' })
  async import(@Body() dto: ImportMenuFromPhotoDto) {
    return this.menuPhotoImport.importFromPreview(dto);
  }
}
