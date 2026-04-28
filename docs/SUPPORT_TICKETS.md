# Tickets de soporte (internos)

## Flujo

1. Usuario **ADMIN** o **SUPER_ADMIN** abre **Ayuda → Soporte**, crea un ticket (asunto + mensaje) y puede seguir el hilo en el detalle del ticket.
2. Al crear, el backend genera un **número secuencial** (`ticketNumber`) y envía un email al destino configurado (solo staff; el usuario no recibe email por ahora).
3. Un **SUPER_ADMIN** gestiona los tickets en **Configuración → Tickets de soporte**: filtros, detalle con datos de usuario / plan / suscripciones, respuestas y cambio de estado (**Abierto** / **En progreso** / **Cerrado**).

## Variables de entorno (backend)

| Variable | Descripción |
|----------|-------------|
| `SUPPORT_TICKETS_ADMIN_EMAIL` | Opcional. Casilla que recibe el aviso de nuevo ticket. |
| `CONTACT_FORM_RECEIVER_EMAIL` | Si no hay `SUPPORT_TICKETS_ADMIN_EMAIL`, se usa como fallback. |
| (sin las anteriores) | Se usa el email del **primer** usuario `SUPER_ADMIN` en la base. |

Requisitos para envío real: SMTP (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, etc.). Sin SMTP, el backend solo registra en logs (igual que otros emails).

## API (autenticada JWT)

- `POST /support-tickets/attachments` — `multipart/form-data`, campo `file`: sube una imagen JPEG/PNG (máx. 5 MB). Devuelve `{ url }` para enviar en `attachmentUrls` al crear el ticket (hasta 5 URLs).
- `POST /support-tickets` — crear (ADMIN, SUPER_ADMIN). Body JSON: `subject`, `message`, opcional `attachmentUrls` (array de strings, URLs devueltas por el endpoint anterior).
- `GET /support-tickets` — listar propios.
- `GET /support-tickets/:id` — detalle propio + mensajes.
- `POST /support-tickets/:id/messages` — responder (ticket no cerrado).
- `GET /support-tickets/admin` — listar todos (SUPER_ADMIN).
- `GET /support-tickets/admin/:id` — detalle + usuario/suscripción (SUPER_ADMIN).
- `PATCH /support-tickets/admin/:id/status` — body `{ "status": "open" \| "in_progress" \| "closed" }`.
- `POST /support-tickets/admin/:id/messages` — responder (SUPER_ADMIN).

## Migración

En el servidor: `npx prisma migrate deploy` (o equivalente). Deben existir las tablas `support_tickets` / `support_ticket_messages` y la columna `attachment_urls` (JSON) en `support_tickets`. Si falta la migración, el API responde **503** con un mensaje que lo indica en lugar de un 500 genérico.

**Si ves “Internal server error”:** suele ser base sin migrar o imagen Docker del backend generada sin `prisma generate` tras cambiar el schema. Corregí migraciones + rebuild/redeploy del backend.
