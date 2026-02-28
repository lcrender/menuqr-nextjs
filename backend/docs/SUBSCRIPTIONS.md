# Sistema de suscripciones

## Resumen

- **PayPal**: suscripciones recurrentes (mensual/anual), webhooks para activación, cancelación, pago fallido y renovación.
- **MercadoPago**: preparado como proveedor futuro (solo Argentina); no implementado aún.
- La activación del plan **solo** se hace vía webhooks del proveedor; el frontend no puede activar suscripciones.

## Base de datos

Ejecutar migración:

```bash
cd backend && npx prisma migrate deploy
```

O para desarrollo:

```bash
npx prisma migrate dev --name add_subscriptions
```

Nuevas entidades:

- **User**: `registration_country`, `declared_country` (opcionales).
- **Subscription**: por usuario, proveedor, `external_subscription_id`, estado, `plan_type` (monthly/yearly), `subscription_plan` (basic/pro/premium), períodos, `cancel_at_period_end`.
- **WebhookEvent**: idempotencia (provider + event_id).

### Backfill: suscripción free para usuarios existentes

Si tenías usuarios creados antes de que existiera la suscripción free al registrar, puedes crearles la suscripción free (ejecutar una sola vez):

**Opción 1 – Script Node (no requiere `psql`):**
```bash
cd backend
node scripts/backfill-free-subscriptions.js
```
El script carga `backend/.env` y usa `DATABASE_URL`. Es idempotente.

**Opción 2 – Con psql:**
```bash
cd backend
psql "$DATABASE_URL" -f scripts/backfill-free-subscriptions.sql
```

También puedes ejecutar el contenido de `scripts/backfill-free-subscriptions.sql` desde cualquier cliente SQL. Es idempotente: si un usuario ya tiene suscripción, no se duplica.

## Proveedor de pago

`getPaymentProvider(user)` devuelve el proveedor para ese usuario. Hoy siempre `paypal`; en el futuro se puede elegir por país/tenant sin hardcodear `if country === 'AR'`.

## Endpoints

- **POST /payment/webhooks/:provider** (paypal | mercadopago)  
  Webhook del proveedor. Cuerpo en bruto para verificar firma. Público.

- **GET /subscriptions/me** (auth)  
  Lista suscripciones del usuario.

- **POST /subscriptions/create** (auth)  
  Crea suscripción en el proveedor. Body: `planType`, `planSlug`, `returnUrl`, `cancelUrl`. Respuesta incluye `approvalUrl` para redirigir al usuario. El plan se activa cuando PayPal envía el webhook de activación.

- **POST /subscriptions/cancel** (auth)  
  Cancela en el proveedor. Body: `externalSubscriptionId` (opcional), `cancelAtPeriodEnd` (opcional).

## Configuración PayPal

En `.env`:

- `PAYPAL_MODE`: sandbox | live
- `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`
- `PAYPAL_WEBHOOK_ID`: ID del webhook en el dashboard (para verificar firma)
- `PAYPAL_PLAN_ID_MONTHLY`, `PAYPAL_PLAN_ID_YEARLY`: IDs de planes creados en PayPal
- Opcional: `PAYPAL_PLAN_ID_BASIC_MONTHLY`, `PAYPAL_PLAN_ID_PRO_MONTHLY`, `PAYPAL_PLAN_ID_PREMIUM_MONTHLY` para mapear a subscription_plan (basic/pro/premium)

En el dashboard de PayPal configurar la URL del webhook:  
`https://tu-dominio.com/payment/webhooks/paypal`

Eventos recomendados: BILLING.SUBSCRIPTION.ACTIVATED, BILLING.SUBSCRIPTION.CANCELLED, BILLING.SUBSCRIPTION.SUSPENDED, BILLING.SUBSCRIPTION.PAYMENT.FAILED, PAYMENT.SALE.COMPLETED.

## Sincronización con Tenant

Cuando un webhook indica activación, cancelación o pago fallido, se actualiza la fila en `subscriptions` y se llama a `syncTenantPlanFromSubscription(userId)`, que actualiza `tenants.plan` con el `subscription_plan` activo o `free` si no hay suscripción activa.
