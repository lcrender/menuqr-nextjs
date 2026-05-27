import { BadRequestException, ValidationError } from '@nestjs/common';

function flattenValidationErrors(errors: ValidationError[], prefix = ''): string[] {
  const messages: string[] = [];
  for (const err of errors) {
    const path = prefix ? `${prefix}.${err.property}` : err.property;
    if (err.constraints) {
      messages.push(...Object.values(err.constraints).map((m) => `${path}: ${m}`));
    }
    if (err.children?.length) {
      messages.push(...flattenValidationErrors(err.children, path));
    }
  }
  return messages;
}

/** Convierte errores de class-validator en mensajes legibles (400). */
export function validationExceptionFactory(errors: ValidationError[]): BadRequestException {
  const messages = flattenValidationErrors(errors);
  const text =
    messages.length === 0
      ? 'Los datos enviados no son válidos.'
      : messages.length === 1
        ? messages[0]
        : messages;
  return new BadRequestException(text);
}
