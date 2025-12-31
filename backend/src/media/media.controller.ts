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
  @UseInterceptors(FileInterceptor('file'))
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
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.body.tenantId : req.user.tenantId;
    return this.mediaService.uploadRestaurantPhoto(tenantId, restaurantId, file);
  }

  @Post('restaurants/:restaurantId/cover')
  @UseInterceptors(FileInterceptor('file'))
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
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.body.tenantId : req.user.tenantId;
    return this.mediaService.uploadRestaurantCover(tenantId, restaurantId, file);
  }

  @Post('items/:itemId/photo')
  @UseInterceptors(FileInterceptor('file'))
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
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.body.tenantId : req.user.tenantId;
    return this.mediaService.uploadItemPhoto(tenantId, itemId, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar media' })
  @ApiResponse({ status: 200, description: 'Media eliminada exitosamente' })
  async deleteMedia(@Param('id') id: string, @Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.query.tenantId : req.user.tenantId;
    await this.mediaService.deleteMedia(id, tenantId);
    return { message: 'Media eliminada exitosamente' };
  }
}

