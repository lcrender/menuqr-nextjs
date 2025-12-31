import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as MinIO from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: MinIO.Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    this.minioClient = new MinIO.Client({
      endPoint: configService.get('MINIO_ENDPOINT'),
      port: parseInt(configService.get('MINIO_PORT', '9000')),
      useSSL: configService.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: configService.get('MINIO_ACCESS_KEY'),
      secretKey: configService.get('MINIO_SECRET_KEY'),
    });

    this.bucketName = configService.get('MINIO_BUCKET', 'menuqr-assets');
    
    // URL pública para acceso desde el frontend (navegador)
    // Usa MINIO_PUBLIC_URL si está configurada, sino usa localhost
    this.publicUrl = configService.get('MINIO_PUBLIC_URL') || 
                     `http://localhost:${configService.get('MINIO_PORT', '9000')}`;
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket ${this.bucketName} creado`);
        
        // Configurar política pública para lectura
        try {
          const policy = {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: { AWS: ['*'] },
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${this.bucketName}/*`],
              },
            ],
          };
          
          await this.minioClient.setBucketPolicy(
            this.bucketName,
            JSON.stringify(policy),
          );
          this.logger.log(`Política pública configurada para bucket ${this.bucketName}`);
        } catch (policyError) {
          this.logger.warn(`No se pudo configurar política pública: ${policyError}`);
        }
      } else {
        // Intentar configurar política incluso si el bucket ya existe
        try {
          const policy = {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: { AWS: ['*'] },
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${this.bucketName}/*`],
              },
            ],
          };
          
          await this.minioClient.setBucketPolicy(
            this.bucketName,
            JSON.stringify(policy),
          );
          this.logger.log(`Política pública configurada para bucket ${this.bucketName}`);
        } catch (policyError) {
          this.logger.warn(`No se pudo configurar política pública: ${policyError}`);
        }
      }
      this.logger.log(`MinIO conectado correctamente`);
    } catch (error) {
      this.logger.error('Error inicializando MinIO:', error);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<{ url: string; filename: string }> {
    try {
      const timestamp = Date.now();
      const filename = `${folder}/${timestamp}-${file.originalname}`;

      await this.minioClient.putObject(
        this.bucketName,
        filename,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );

      // Usar URL pública para que el frontend pueda acceder
      const url = `${this.publicUrl}/${this.bucketName}/${filename}`;

      return { url, filename };
    } catch (error) {
      this.logger.error('Error subiendo archivo a MinIO:', error);
      throw error;
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, filename);
    } catch (error) {
      this.logger.error(`Error eliminando archivo ${filename}:`, error);
      throw error;
    }
  }

  getPublicUrl(filename: string): string {
    return `${this.publicUrl}/${this.bucketName}/${filename}`;
  }
}

