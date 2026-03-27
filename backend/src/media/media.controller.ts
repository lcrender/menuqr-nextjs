import { Controller, Post, Delete, Param, UseInterceptors, UploadedFile, Request, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('media')
@Controller('media')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('restaurants/:restaurantId/photo')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'Subir logo de restaurante' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Logo subido exitosamente' })
  async uploadRestaurantPhoto(
    @Param('restaurantId') restaurantId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.mediaService.uploadRestaurantPhoto(req.user, restaurantId, file);
  }

  @Post('restaurants/:restaurantId/cover')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 12 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'Subir foto de portada de restaurante' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Foto de portada subida exitosamente' })
  async uploadRestaurantCover(
    @Param('restaurantId') restaurantId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.mediaService.uploadRestaurantCover(req.user, restaurantId, file);
  }

  @Post('items/:itemId/photo')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'Subir foto de producto' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Foto subida exitosamente' })
  async uploadItemPhoto(
    @Param('itemId') itemId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.mediaService.uploadItemPhoto(req.user, itemId, file);
  }

  @Delete('items/:itemId/photo')
  @ApiOperation({ summary: 'Eliminar foto del producto (una por producto)' })
  @ApiResponse({ status: 200, description: 'Foto eliminada del sistema' })
  async deleteItemPhoto(
    @Param('itemId') itemId: string,
    @Request() req,
  ) {
    await this.mediaService.deleteItemPhoto(req.user, itemId);
    return { message: 'Foto eliminada' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar media por ID' })
  @ApiResponse({ status: 200, description: 'Media eliminada exitosamente' })
  async deleteMedia(@Param('id') id: string, @Request() req) {
    await this.mediaService.deleteMedia(req.user, id);
    return { message: 'Media eliminada exitosamente' };
  }
}

