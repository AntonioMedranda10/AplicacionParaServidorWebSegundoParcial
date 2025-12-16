# Arquitectura de Microservicios con Webhooks e Idempotencia

Implementación en NestJS con Gateway, Reservations y Spaces. Estrategia avanzada: **Idempotent Consumer** reforzada, publicación de webhooks firmados HMAC hacia **Supabase Edge Functions** (logger y notifier) y deduplicación en consumidores.

## Servicios y puertos
- Gateway: 3000
- Reservations: 3001 (Postgres propio)
- Spaces: 3002 (Postgres propio)
- RabbitMQ: 5672 / 15672
- Redis: 6379

## Arranque rápido
```powershell
docker-compose up -d
```
Después, si corres fuera de Docker, cada servicio:
```powershell
cd gateway-service && npm run start:dev
cd reservations-service && npm run start:dev
cd spaces-service && npm run start:dev
```

## Variables de entorno (usar .env)
Copia `.env.example` a `.env` y completa:
- `RABBITMQ_URL` (ej. amqp://guest:guest@rabbitmq:5672)
- `DATABASE_URL_RESERVATIONS`, `DATABASE_URL_SPACES`
- `REDIS_URL`
- `WEBHOOK_SECRET` (firma HMAC compartida)
- `WEBHOOK_LOGGER_URL`, `WEBHOOK_NOTIFIER_URL` (URLs de Edge Functions en Supabase)
- `WEBHOOK_LOGGER_SECRET`, `WEBHOOK_NOTIFIER_SECRET` (opcional, por defecto `WEBHOOK_SECRET`)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (para que las Edge Functions escriban en tablas)
 - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (para que las Edge Functions escriban en tablas)
 - `SENDGRID_API_KEY`, `EMAIL_FROM`, `EMAIL_TO` (para el notifier por correo; si faltan, el notifier fallará y el publisher reintentará)

## Flujo
1) Gateway recibe `POST /gateway/reservations`, propaga `x-idempotency-key` y hace RPC `create_reservation` por RabbitMQ.
2) Reservations persiste en Postgres con idempotencia (`idempotency_keys`), emite `reservation.created` y publica webhooks firmados HMAC.
3) Spaces consume `reservation.created`, deduplica en Redis y descuenta capacidad en Postgres; usa DLX tras 3 nacks.
4) Edge Functions validan firma/timestamp, deduplican y: logger registra, notifier envía correo (SendGrid).

## Webhooks
Payload estándar (ejemplo):
```json
{
  "event": "reservation.created",
  "version": "1.0",
  "id": "evt-uuid",
  "idempotency_key": "key-123",
  "timestamp": "2025-12-15T10:30:45.123Z",
  "data": { "reservation_id": 1, "space_id": 10, "user_id": 5, "start_date": "2025-12-20T09:00:00.000Z", "end_date": "2025-12-20T10:00:00.000Z" },
  "metadata": { "source": "reservations-service", "environment": "local", "correlation_id": "key-123" }
}
```
Headers: `X-Webhook-Signature`, `X-Webhook-Timestamp`, `X-Webhook-Idempotency-Key`.
Reintentos: 6 intentos (1s,2s,4s,8s,16s,32s). Auditoría en `webhook_deliveries`.

## Edge Functions (Supabase)
Rutas: `supabase/functions/webhook-event-logger`, `supabase/functions/webhook-external-notifier`.
- Logger: valida HMAC, anti-replay, dedupe; inserta en `webhook_events` y `processed_webhooks` si hay `SUPABASE_*`.
 - Notifier: valida HMAC, anti-replay, dedupe; envía correo (SendGrid) y registra entrega en `webhook_deliveries` si hay `SUPABASE_*`.
Despliegue sugerido:
```bash
supabase init              # si no existe
supabase link --project-ref <tu-ref>
supabase secrets set WEBHOOK_SECRET=... SENDGRID_API_KEY=... EMAIL_FROM=... EMAIL_TO=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
supabase functions deploy webhook-event-logger
supabase functions deploy webhook-external-notifier
```

## Endpoints
- Gateway: `POST /gateway/reservations`, `GET /gateway/reservations/:id`, `GET /gateway/spaces`
- Spaces: `GET /spaces`, `POST /spaces`, `PUT/DELETE /spaces/:id`, `GET /spaces/metrics`
- Health: `/health` en cada servicio

## Pruebas rápidas
1) Happy path: crea reserva con `x-idempotency-key` → verifica en reservations DB y que se emita webhook.
2) Duplicado: repite la misma key → mismo resultado, sin segunda inserción.
3) Firma inválida: altera payload antes del logger → debe responder 401.
4) Reintentos: desactiva temporalmente la URL de webhook y revisa `webhook_deliveries` (6 intentos).
5) Métricas: `GET http://localhost:3000/spaces/metrics` (dedupe en consumidor).

## Dónde obtener las keys
- `WEBHOOK_SECRET`: define una cadena propia; debe coincidir entre publisher (reservations) y Edge Functions (secreto en Supabase).
- `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`: en el panel de Supabase (Project Settings → API). Se usan solo en las funciones para escribir en tablas.
 - `SENDGRID_API_KEY`: crea una API Key en SendGrid (Full Access o Mail Send). `EMAIL_FROM`: dirección remitente verificada en SendGrid. `EMAIL_TO`: dirección destino para notificaciones.
# Arquitectura de Microservicios (Gateway + Reservations + Spaces) con Webhooks e Idempotencia

Esta versión implementa la estrategia avanzada **Idempotent Consumer** reforzada y agrega publicación de webhooks firmados HMAC hacia **Supabase Edge Functions** (logger y notifier). Todo se documenta en español.

## Novedades
- `spaces-service` ahora persiste en Postgres vía TypeORM (antes en memoria) y mantiene deduplicación en el consumidor con Redis + DLX.
- `reservations-service` publica webhooks `reservation.created`, los firma con HMAC, audita eventos/entregas y mantiene idempotencia en DB.
- Edge Functions listas: `webhook-event-logger` y `webhook-external-notifier` (validación HMAC, anti-replay, dedupe; notifier usa SendGrid si hay credenciales).
- `.env.example` limpio con variables para RabbitMQ, Postgres, Redis, Webhooks, Supabase y SendGrid.

## Arranque rápido
```powershell
docker-compose up -d
```
Servicios expuestos: gateway 3000, reservations 3001, spaces 3002, RabbitMQ (5672/15672), Redis (6379), Postgres por servicio.

## Variables principales (.env)
- Broker: `RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672`
- Bases: `DATABASE_URL_RESERVATIONS`, `DATABASE_URL_SPACES`
- Redis: `REDIS_URL=redis://redis:6379`
- Webhooks: `WEBHOOK_SECRET`, `WEBHOOK_LOGGER_URL`, `WEBHOOK_NOTIFIER_URL`, opcional `WEBHOOK_LOGGER_SECRET` / `WEBHOOK_NOTIFIER_SECRET`
- Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `WEBHOOK_MAX_AGE_SECONDS`
 - SendGrid: `SENDGRID_API_KEY`, `EMAIL_FROM`, `EMAIL_TO` (para el notifier)

## Flujo
1) Gateway recibe `POST /gateway/reservations`, propaga `x-idempotency-key` y envía RPC `create_reservation` por RabbitMQ.
2) `reservations-service` guarda la reserva en Postgres con idempotencia (tabla `idempotency_keys`), emite `reservation.created` y dispara webhooks.
3) `spaces-service` consume `reservation.created`, usa Redis para dedupe, descuenta capacidad en Postgres y usa DLX tras 3 nacks.
4) Edge Functions validan firma y timestamp; logger registra, notifier envía correo (SendGrid).

## Webhooks (publisher)
Payload (ejemplo):
```json
{
    "event": "reservation.created",
    "version": "1.0",
    "id": "evt-uuid",
    "idempotency_key": "key-123",
    "timestamp": "2025-12-15T10:30:45.123Z",
    "data": {
        "reservation_id": 1,
        "space_id": 10,
        "user_id": 5,
        "start_date": "2025-12-20T09:00:00.000Z",
        "end_date": "2025-12-20T10:00:00.000Z"
    },
    "metadata": {
        "source": "reservations-service",
        "environment": "local",
        "correlation_id": "key-123"
    }
}
```
Headers: `X-Webhook-Signature`, `X-Webhook-Timestamp`, `X-Webhook-Idempotency-Key`.
Backoff (demo corto): 1s, 2s, 4s, 8s, 16s, 32s (6 intentos). Auditoría en `webhook_deliveries`.

## Edge Functions (Supabase)
Ubicación: `supabase/functions`.
- `webhook-event-logger`: HMAC + anti-replay + dedupe, inserta en `webhook_events` y `processed_webhooks` si hay `SUPABASE_*`.
 - `webhook-external-notifier`: HMAC + anti-replay + dedupe, envía correo (SendGrid) y registra entrega en `webhook_deliveries`.
Despliegue sugerido:
```bash
supabase functions deploy webhook-event-logger
supabase functions deploy webhook-external-notifier
```
(antes: `supabase init`, `supabase link`, `supabase secrets set ...`).

## Endpoints
- Gateway: `POST /gateway/reservations`, `GET /gateway/reservations/:id`, `GET /gateway/spaces`
- Spaces: `GET /spaces`, `POST /spaces`, `PUT/DELETE /spaces/:id`, `GET /spaces/metrics`
- Health: `/health` en cada servicio

## Pruebas sugeridas
1. Happy path: crear reserva por gateway (con `x-idempotency-key`) y verificar en reservations DB + webhook entregado.
2. Duplicado: repetir la misma key => mismo resultado (sin doble inserción).
3. Firma inválida: alterar payload y llamar a Edge Function => 401.
4. Reintentos: apagar URL de webhook y observar entregas fallidas en `webhook_deliveries` (6 intentos).
5. Métricas: `GET http://localhost:3000/spaces/metrics` muestra dedupe counts.

## Tablas relevantes (Postgres)
- `reservations`, `idempotency_keys`
- `spaces`
- `webhook_subscriptions`, `webhook_events`, `webhook_deliveries`, `processed_webhooks`

## Notas
- Puedes usar CloudAMQP en vez de RabbitMQ local ajustando `RABBITMQ_URL`.
- Configura `WEBHOOK_SECRET` y URLs de Edge antes de probar webhooks.
 - Si no configuras SendGrid, el notifier responderá 500 para que el publisher reintente (comportamiento esperado en la demo).

## Cambios realizados (Idempotencia en `reservations-service`)

- Se añadió almacenamiento de keys de idempotencia en la BD del `reservations-service` (`idempotency_keys`).
- `reservations-service` ahora acepta idempotency key (vía header `x-idempotency-key` o payload) y:
    - Si la key ya existe devuelve la reserva ya creada (no crea duplicados).
    - Si no existe, crea la reserva dentro de la misma transacción y guarda el mapping key→reservationId.
- El `gateway-service` ahora envía peticiones de creación de reserva por RMQ usando el pattern `create_reservation` (request-response). El `reservations-service` escucha ese patrón, persiste y emite `reservation.created` a RabbitMQ.

## Configuración de RabbitMQ (qué y dónde)
### Usar CloudAMQP (RabbitMQ en la nube)

- Si vas a usar RabbitMQ en la nube (CloudAMQP), crea un archivo `.env` en la raíz del repo copiando `.env.example` y reemplaza `REPLACE_WITH_PASSWORD` con la contraseña que te entrega CloudAMQP (ver pantallas en tu proveedor). Ejemplo:

```text
RABBITMQ_URL=amqps://ykmlnnxb:p_Ha5mM-51fO8Bfdf--lNB3-rWMKyRuR@porpoise.rmq.cloudamqp.com/ykmlnnxb
```

- Con esto los servicios se conectarán al broker en la nube. No es necesario iniciar el servicio `rabbitmq` local del `docker-compose` si se usa el broker remoto.


- URL de conexión: variable de entorno `RABBITMQ_URL` (ej. `amqp://user:password@rabbitmq:5672`).
- Colas / patterns usadas:
    - `gateway_to_reservations_queue`: cola usada por el `gateway` para enviar requests RPC del pattern `create_reservation`.
    - `reservations_queue`: cola interna del `reservations-service` (emisión/events).
    - `spaces_queue`: cola escuchada por `spaces-service` para eventos `reservation.created`.
    - DLX configurado para `spaces_queue` (dead-letter-exchange) — mensajes con reintentos agotados van a DLX.

## Cómo probar el flujo RMQ + Idempotencia

1) Levanta infra y servicios:

```powershell
docker-compose up -d

# en tres terminales locales (opcional):
cd gateway-service; npm install; npm run start:dev
[9:42:37 a. m.] Starting compilation in watch mode...

[9:42:41 a. m.] Found 0 errors. Watching for file changes.

[Nest] 23800  - 15/12/2025, 9:42:43 a. m.     LOG [NestFactory] Starting Nest application...
[Nest] 23800  - 15/12/2025, 9:42:43 a. m.     LOG [InstanceLoader] AppModule dependencies initialized +27ms
[Nest] 23800  - 15/12/2025, 9:42:43 a. m.     LOG [InstanceLoader] IdempotencyModule dependencies initialized +0ms
[Nest] 23800  - 15/12/2025, 9:42:43 a. m.     LOG [InstanceLoader] ConfigHostModule dependencies initialized +1ms
[Nest] 23800  - 15/12/2025, 9:42:43 a. m.     LOG [InstanceLoader] ConfigModule dependencies initialized +1ms
[Nest] 23800  - 15/12/2025, 9:42:43 a. m.     LOG [InstanceLoader] SpacesModule dependencies initialized +0ms
[Nest] 23800  - 15/12/2025, 9:42:46 a. m.   ERROR [Server] Connection to transport failed. Trying to reconnect...
[Nest] 23800  - 15/12/2025, 9:42:46 a. m.   ERROR [Server] Error: getaddrinfo ENOTFOUND rabbitmq
[Nest] 23800  - 15/12/2025, 9:42:53 a. m.   ERROR [Server] Connection to transport failed. Trying to reconnect...
[Nest] 23800  - 15/12/2025, 9:42:53 a. m.   ERROR [Server] Error: getaddrinfo ENOTFOUND rabbitmq
[Nest] 23800  - 15/12/2025, 9:43:01 a. m.   ERROR [Server] Connection to transport failed. Trying to reconnect...
[Nest] 23800  - 15/12/2025, 9:43:01 a. m.   ERROR [Server] Error: getaddrinfo ENOTFOUND rabbitmq
; npm install; npm run start:dev
