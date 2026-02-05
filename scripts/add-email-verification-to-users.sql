-- Agregar columnas de verificación de email a la tabla users
-- Si las columnas ya existen, no se producirá error gracias a IF NOT EXISTS

-- Verificar si las columnas existen antes de agregarlas
DO $$
BEGIN
    -- Agregar email_verified si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false NOT NULL;
    END IF;

    -- Agregar email_verification_token si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email_verification_token'
    ) THEN
        ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255) NULL;
    END IF;

    -- Agregar email_verified_at si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email_verified_at'
    ) THEN
        ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP NULL;
    END IF;
END $$;

-- Crear índice para búsquedas rápidas por token
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token 
ON users(email_verification_token) 
WHERE email_verification_token IS NOT NULL;
