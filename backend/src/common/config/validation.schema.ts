import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // ========================================
  // BASE DE DATOS
  // ========================================
  DATABASE_URL: Joi.string()
    .required()
    .uri({ scheme: ['postgresql', 'postgres'] }),

  // ========================================
  // REDIS
  // ========================================
  REDIS_URL: Joi.string()
    .required()
    .uri({ scheme: ['redis'] }),

  // ========================================
  // JWT - TOKENS
  // ========================================
  JWT_SECRET: Joi.string().required().min(32),
  JWT_REFRESH_SECRET: Joi.string().required().min(32),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // ========================================
  // MINIO - STORAGE
  // ========================================
  MINIO_ENDPOINT: Joi.string().required(),
  MINIO_PORT: Joi.number().port().default(9000),
  MINIO_PUBLIC_URL: Joi.string().uri().optional(),
  MINIO_ACCESS_KEY: Joi.string().required(),
  MINIO_SECRET_KEY: Joi.string().required(),
  MINIO_BUCKET: Joi.string().required(),
  MINIO_USE_SSL: Joi.boolean().default(false),
  MINIO_REGION: Joi.string().default('us-east-1'),

  // ========================================
  // EMAIL - SMTP
  // ========================================
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().port().optional(),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),
  SMTP_FROM: Joi.string().email().optional(),
  SMTP_FROM_NAME: Joi.string().optional(),

  // ========================================
  // APLICACIÓN
  // ========================================
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3001),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  BACKEND_URL: Joi.string().uri().default('http://localhost:3001'),

  // ========================================
  // RATE LIMITING
  // ========================================
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000), // 15 minutos
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),

  // ========================================
  // LOGGING
  // ========================================
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
  LOG_FORMAT: Joi.string().valid('json', 'simple').default('json'),

  // ========================================
  // CORS
  // ========================================
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: Joi.boolean().default(true),

  // ========================================
  // SEGURIDAD
  // ========================================
  BCRYPT_ROUNDS: Joi.number().default(12),
  PASSWORD_MIN_LENGTH: Joi.number().default(8),
  PASSWORD_REQUIRE_UPPERCASE: Joi.boolean().default(true),
  PASSWORD_REQUIRE_LOWERCASE: Joi.boolean().default(true),
  PASSWORD_REQUIRE_NUMBERS: Joi.boolean().default(true),
  PASSWORD_REQUIRE_SPECIAL_CHARS: Joi.boolean().default(true),

  // ========================================
  // CACHE
  // ========================================
  CACHE_TTL: Joi.number().default(3600), // 1 hora por defecto
  MENU_CACHE_TTL: Joi.number().default(1800), // 30 minutos

  // ========================================
  // QR
  // ========================================
  QR_SIZE: Joi.number().default(300),
  QR_MARGIN: Joi.number().default(2),
  QR_COLOR: Joi.string().pattern(/^[0-9A-Fa-f]{6}$/).default('000000'),
  QR_BACKGROUND: Joi.string().pattern(/^[0-9A-Fa-f]{6}$/).default('FFFFFF'),

  // ========================================
  // PLANES Y LÍMITES
  // ========================================
  FREE_PLAN_RESTAURANT_LIMIT: Joi.number().default(1),
  FREE_PLAN_MENU_LIMIT: Joi.number().default(3),
  FREE_PLAN_ITEM_LIMIT: Joi.number().default(50),

  // ========================================
  // DESARROLLO
  // ========================================
  DEBUG: Joi.boolean().default(false),
  SEED_DATA: Joi.boolean().default(false),
  SKIP_EMAIL_VERIFICATION: Joi.boolean().default(false),
});

