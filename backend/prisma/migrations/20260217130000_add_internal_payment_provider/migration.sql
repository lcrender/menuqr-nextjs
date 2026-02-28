-- Add 'internal' to PaymentProvider enum (for free plan subscription record)
ALTER TYPE "PaymentProvider" ADD VALUE IF NOT EXISTS 'internal';
