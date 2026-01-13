Implementación: Workflow n8n — Gemini → Telegram

Resumen
- Workflow: Webhook (reserva) → Set (normalize) → HTTP Request (api-gateway /api/procesar) → Set (map response a message) → HTTP Request (Telegram sendMessage) → Respond to Webhook
- Requisitos: n8n corriendo en Docker (o host), api-gateway y backend corriendo en tu máquina, claves: GEMINI (en api-gateway) y TELEGRAM_API_KEY (para el bot).

Variables y URLs (configura según tu entorno)
- `API_GATEWAY_URL`: URL pública desde n8n hacia tu api-gateway. Si n8n corre en Docker y el gateway en tu host Windows usa: `http://host.docker.internal:3000`.
- `TELEGRAM_API_KEY`: clave del bot (no subir al repo).
- `TELEGRAM_CHAT_ID`: id del chat o usuario donde enviar el mensaje.
- `WEBHOOK_PATH`: path del webhook en n8n, por ejemplo: `reserva`.

1) Webhook (Trigger)
- HTTP Method: POST
- Path: `reserva` (o `reserva-webhook` si prefieres)
- Respond: No (vamos a usar `Respond to Webhook` al final)

2) Set (normalizar entrada)
- Crea campos (Expression) exactos:
  - `payload` = `{{$json["body"]?.data ?? $json["data"] ?? $json}}`  
    (esto extrae la `data` enviada por tu backend; ajusta si tu payload está en otra ruta)
  - `evento` = `{{$json["body"]?.evento ?? $json["evento"] ?? ''}}`

3) HTTP Request — Llamada a API Gateway (Gemini)
- Resource: `HTTP Request`
- Method: `POST`
- URL: `{{ $env.API_GATEWAY_URL || 'http://host.docker.internal:3000' }}/api/procesar`  
  (si no puedes usar env en expressions, pega directamente `http://host.docker.internal:3000/api/procesar`)
- Authentication: none (si tu gateway no requiere auth localmente)
- Headers: `Content-Type: application/json`
- Body Parameters: Raw Body
  - Raw JSON (Expression):
    ```json
    {{$json["payload"]}}
    ```
  - Nota: Si tu `api-gateway` espera un formato distinto, adapta el body. El objetivo es que el gateway reciba la reserva y devuelva el texto generado por Gemini.

4) Set (mapear respuesta a `message`)
- Crea campo `message` con Expression:
  - Si la respuesta de `api-gateway` trae `body.message` o `json.message` usa: `{{$node["HTTP Request"].json["message"] ?? $json["message"] ?? $node["HTTP Request"].json["body"]?.message}}`
  - Ejemplo simple: `{{$node["HTTP Request"].json["message"] || JSON.stringify($node["HTTP Request"].json)}}`

5) HTTP Request — Enviar a Telegram
- Method: `POST`
- URL (ejemplo): `https://api.telegram.org/bot_TELEGRAM_API_KEY_/sendMessage`
  - Reemplaza `_TELEGRAM_API_KEY_` por la variable o credencial en n8n.
  - Mejor: en el campo URL pon (Expression): `https://api.telegram.org/bot${$json["telegramApiKey"]}/sendMessage` y antes del nodo crea un `Set` o credencial con `telegramApiKey`.
- Body (Raw / JSON):
  ```json
  {
    "chat_id": "_TELEGRAM_CHAT_ID_",
    "text": {{$json["message"] | $json["message"] ? $json["message"] : "\"(sin mensaje)\""}}
  }
  ```
  - Reemplaza `_TELEGRAM_CHAT_ID_` con tu `chat_id` o usa expresión `{{$env.TELEGRAM_CHAT_ID}}` si lo guardaste como env var.
- Headers: `Content-Type: application/json`

6) Respond to Webhook
- Status Code: 200
- Response Body (JSON): `{ "status": "ok" }`

Notas prácticas y seguridad
- No pongas tu `TELEGRAM_API_KEY` directamente en el JSON del workflow si vas a compartirlo. En n8n crea `Credentials` o usa variables de entorno en Docker compose.
- Si n8n corre en Docker y tus servicios en host Windows, usa `host.docker.internal` para que n8n acceda a `api-gateway`/`backend`.
- Verifica en `Executions` que el `HTTP Request` al gateway devuelve la clave `message` (o adáptalo a la ruta real).

Comandos útiles
- Si inicias n8n en Docker compose (archivo en este repo `n8n/docker-compose.yml`):

```powershell
cd n8n
docker compose up -d
```

- Para configurar variables en Docker Compose, añade en `environment`:
  - `TELEGRAM_API_KEY` (no subir al repo)
  - `TELEGRAM_CHAT_ID`
  - `API_GATEWAY_URL` (opcional)

Export y evidencia
- Después de probar, exporta el workflow desde n8n (Export) para adjuntarlo a la entrega.
- Toma capturas de `Executions` mostrando `Webhook` → `HTTP Request` → `Telegram` exitosos.

Si quieres, genero un `workflow` JSON exportable con placeholders para que lo importes directamente en n8n. ¿Lo prefieres así (lo generaré) o prefieres que lo haga directamente en tu instancia n8n si me das acceso (no recomendable)?
