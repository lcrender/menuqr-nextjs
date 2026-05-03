# Sistema de suscripciones

## Resumen

- **PayPal**: suscripciones recurrentes (USD) para usuarios internacionales. Webhooks para activación, cancelación, pago fallido y renovación.
- **MercadoPago**: suscripciones recurrentes (ARS) para Argentina. API Preapproval, webhooks para autorización y pagos.
- **Pricing por región**: tabla `plans` + `plan_prices` (país, moneda, precio, proveedor). Argentina (AR) → ARS + MercadoPago; resto → GLOBAL (USD + PayPal). Fallback automático a GLOBAL si no hay precio para el país.
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
- **Subscription**: por usuario, proveedor, `external_subscription_id`, estado, `plan_type` (monthly/yearly), `subscription_plan` (starter/pro/premium), períodos, `cancel_at_period_end`.
- **WebhookEvent**: idempotencia (provider + event_id).
- **plans**: id, name, description (ej. plan_starter, plan_pro).
- **plan_prices**: plan_id, country (AR, GLOBAL, …), currency, price, payment_provider. Un precio por (plan_id, country). Migración: `20260206000000_add_plans_and_plan_prices`.

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

`PaymentProviderService.getPaymentProvider(user)` usa `declared_country` o `registration_country` del usuario: **AR → mercadopago**, resto → **paypal**.

## Endpoints

- **GET /pricing** (opcional auth)  
  Devuelve precios por región. Si el usuario envía Bearer token, se usa su país (billing_country de suscripción, o declared_country, o registration_country); si no, se devuelve GLOBAL (USD/PayPal). Respuesta: `{ country, currency, paymentProvider, plans: [{ slug, name, price, priceYearly, currency, paymentProvider }] }`. El **precio anual** (`priceYearly`) se calcula como **mensual × 10** (sin columna en BD); mismo proveedor por región. **MercadoPago** usa ese monto en preapproval anual; **PayPal** sigue usando los IDs de plan mensual/anual configurados en `.env`.

- **POST /payment/webhooks/:provider** (paypal | mercadopago)  
  Webhook del proveedor. Cuerpo en bruto para verificar firma. Público.

- **GET /subscriptions/me** (auth)  
  Lista suscripciones del usuario.

- **POST /subscriptions/create** (auth)  
  Crea suscripción en el proveedor según país del usuario (AR → MercadoPago, resto → PayPal). Body: `planType`, `planSlug`, `returnUrl`, `cancelUrl`. Respuesta incluye `approvalUrl` (o `init_point` para MP) para redirigir al usuario. El plan se activa cuando el proveedor envía el webhook de activación.

- **POST /subscriptions/cancel** (auth)  
  Cancela en el proveedor. Body: `externalSubscriptionId` (opcional), `cancelAtPeriodEnd` (opcional).

## Configuración PayPal

El modo **sandbox** vs **live** lo puede fijar el super admin en el panel (**Configuración → PayPal**, `/admin/config/paypal`): se guarda en `app_settings` (`paypal_mode`). Si no hay valor guardado, se usa `PAYPAL_MODE` del entorno (por defecto `sandbox`).

**GET** y **PATCH** `/admin/paypal-config` (JWT, `SUPER_ADMIN`). PATCH body: `{ "mode": "sandbox" | "live" }`.

En `.env` podés cargar **live** y **sandbox** a la vez; el modo activo lo elige el super admin (o `PAYPAL_MODE` si no hay fila en BD).

**Credenciales**

- Live: `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`
- Sandbox: `PAYPAL_CLIENT_ID_SANDBOX`, `PAYPAL_SECRET_SANDBOX`

**Webhooks (verificación de firma)**

- Live: `PAYPAL_WEBHOOK_ID`
- Sandbox: `PAYPAL_WEBHOOK_ID_SANDBOX`  
  Si el mismo endpoint recibe eventos de ambos entornos, el backend prueba verificar con ambos IDs.

**Planes de suscripción (6 por entorno)** — el slug `starter` usa el prefijo `BASIC` en el nombre de variable:

| Variable (live) |
|-----------------|
| `PAYPAL_PLAN_ID_BASIC_MONTHLY` |
| `PAYPAL_PLAN_ID_BASIC_YEARLY` |
| `PAYPAL_PLAN_ID_PRO_MONTHLY` |
| `PAYPAL_PLAN_ID_PRO_YEARLY` |
| `PAYPAL_PLAN_ID_PREMIUM_MONTHLY` |
| `PAYPAL_PLAN_ID_PREMIUM_YEARLY` |

Para sandbox, los mismos con sufijo `_SANDBOX` (ej. `PAYPAL_PLAN_ID_PRO_MONTHLY_SANDBOX`). Opcional: `PAYPAL_PLAN_ID_MONTHLY` / `PAYPAL_PLAN_ID_YEARLY` y `PAYPAL_PLAN_ID_MONTHLY_SANDBOX` / `PAYPAL_PLAN_ID_YEARLY_SANDBOX` como respaldo genérico.

En el dashboard de PayPal configurar la URL del webhook:  
`https://tu-dominio.com/payment/webhooks/paypal`

Eventos recomendados: BILLING.SUBSCRIPTION.ACTIVATED, BILLING.SUBSCRIPTION.CANCELLED, BILLING.SUBSCRIPTION.SUSPENDED, BILLING.SUBSCRIPTION.PAYMENT.FAILED, PAYMENT.SALE.COMPLETED.

## Configuración MercadoPago (Argentina)

En `.env`:

- `MERCADOPAGO_ACCESS_TOKEN`: access token de **producción** (cobros reales).
- `MERCADOPAGO_ACCESS_TOKEN_TEST`: access token de **prueba** (cuentas de test / sandbox).
- `MERCADOPAGO_WEBHOOK_SECRET` (recomendado en producción): clave de firma del webhook en el panel de Mercado Pago. Si está definida, el backend valida la cabecera `x-signature`. Si no está, acepta notificaciones sin verificar (útil solo en desarrollo).

El modo activo (**prueba** vs **producción**) lo define el super admin en el panel (**Configuración → Mercado Pago**): se guarda en la tabla `app_settings` (`mercadopago_mode` = `sandbox` | `production`). Por defecto, sin fila en BD, se usa **producción**. La API elige el token según ese modo.

URL del webhook: `https://tu-dominio.com/payment/webhooks/mercadopago`

Eventos: autorización de preapproval, pagos creados, preapproval cancelado. Al confirmar pago/autorización se actualiza `subscriptions` y se sincroniza `tenants.plan`.

**Reglas de negocio (checkout):** no se permite crear una nueva suscripción de pago si ya existe una **activa** con el mismo proveedor; hay que cancelarla antes. Las suscripciones **incomplete** previas en Mercado Pago se cancelan en el proveedor y se marcan `canceled` en BD al iniciar un nuevo checkout, para evitar preapprovals colgados.

## Super admin: vista de catálogo en el panel

- **GET `/admin/plan-catalog`** (JWT, rol `SUPER_ADMIN`): devuelve límites por plan de tenant (alineados con `plan-limits.constants.ts`), plantillas estándar vs Pro, y filas de `plans` / `plan_prices` (ARS + Mercado Pago, USD + PayPal).
- En el frontend: **Admin → Configuración → Suscripciones** (`/admin/config/subscriptions`).
- **Mercado Pago (modo prueba/producción)**: **GET** y **PATCH** `/admin/mercadopago-config` (JWT, `SUPER_ADMIN`). PATCH body: `{ "mode": "sandbox" | "production" }`. Respuesta incluye `hasProductionTokenConfigured` / `hasTestTokenConfigured` (sin exponer secretos). UI: `/admin/config/mercadopago`.
- **PayPal (sandbox / live)**: **GET** y **PATCH** `/admin/paypal-config` (JWT, `SUPER_ADMIN`). PATCH body: `{ "mode": "sandbox" | "live" }`. Respuesta incluye `hasLiveCredentialsConfigured` y `hasSandboxCredentialsConfigured` (sin exponer secretos). UI: `/admin/config/paypal`.
- **Límites por plan de tenant**: **GET** y **PUT** `/admin/plan-limits` (`SUPER_ADMIN`). Persistencia en `tenant_plan_limit_overrides`; sin filas se usan los defaults de `plan-limits.constants.ts`. La API (restaurantes, menús, productos, menú público, fotos, downgrade de plan) lee límites vía `PlanLimitsService`. UI: `/admin/config/plan-limits`.

## Sincronización con Tenant

Cuando un webhook indica activación, cancelación o pago fallido, se actualiza la fila en `subscriptions` y se llama a `syncTenantPlanFromSubscription(userId)`, que actualiza `tenants.plan` con el `subscription_plan` activo o `free` si no hay suscripción activa.
