# Proyecto MCP – Reservas Inteligentes

Arquitectura de referencia para el Taller 3 (MCP + IA). Integra microservicios NestJS existentes con un servidor Model Context Protocol (MCP) y un API Gateway que conversa con Gemini para orquestar Tools inteligentes.

---

## Arquitectura general

```
┌───────────┐     JSON-RPC 2.0      ┌───────────────┐     HTTP REST      ┌──────────┐
│ API       │ ─────────────────────▶ │ MCP Server    │ ─────────────────▶ │ Backend   │
│ Gateway   │ ◀───────────────────── │ (Tools)       │ ◀───────────────── │ NestJS    │
│ + Gemini  │     Respuestas IA      │ Express + Zod │     CRUD espacios  │ + SQLite  │
└───────────┘                        └───────────────┘                    └──────────┘
        │                                     │
        │                                     │
        └──────────► Gemini 2.5 Flash ◄───────┘
```

- **Backend (Puerto 3002)**: microservicio NestJS + TypeORM/SQLite con entidades `Espacio` y `Reserva`. Expone CRUD y endpoints especializados (`/espacios/buscar`, `/reservas/disponibilidad`).
- **MCP Server (Puerto 3001)**: Express + JSON-RPC 2.0. Publica Tools (`buscar_espacio`, `validar_disponibilidad`, `crear_reserva`) con validaciones Zod y delega en el Backend.
- **API Gateway (Puerto 3000)**: NestJS que conversa con Gemini (Function Calling). Descubre las Tools del MCP, envía el prompt del usuario y responde en lenguaje natural.

| Componente    | Tecnología principal                     | Puerto | Descripción breve |
| ------------- | ---------------------------------------- | ------ | ----------------- |
| Backend       | NestJS 11, TypeORM, SQLite               | 3002   | CRUD espacios/reservas reutilizado de talleres previos |
| MCP Server    | Express 5, Zod, JSON-RPC 2.0             | 3001   | Expone Tools y valida parámetros antes de ir al backend |
| API Gateway   | NestJS 11 + `@google/generative-ai`      | 3000   | Orquesta la conversación con Gemini y encadena Tools |
| Modelo IA     | Gemini 2.0 Flash (Google AI Studio)      | Cloud  | Decide qué Tool utilizar según la intención del usuario |

---

## Estructura del repositorio

```
proyecto-mcp/
├── apps/
│   ├── backend/         # Microservicio NestJS + SQLite
│   ├── mcp-server/      # Servidor MCP (Express)
│   └── api-gateway/     # Gateway NestJS + Gemini
└── README.md            # Este documento
```

Cada app mantiene su propio `package.json`, dependencias y scripts.

---

## Prerrequisitos

- Node.js 18+ y npm 10+
- SQLite 3 (CLI opcional para inspeccionar `apps/backend/data/inventario.db`)
- Cuenta en Google AI Studio con clave de Gemini 2.0 Flash
- Postman / Thunder Client opcional para pruebas manuales

---

## Instalación

Ejecutar en la raíz del repositorio:

```bash
# 1. Clonar e instalar dependencias de cada app
cd apps/backend && npm install
cd ../mcp-server && npm install
cd ../api-gateway && npm install
```

> Tip: usa tres terminales distintas para mantener cada servicio corriendo en paralelo.

---

## Configuración de entorno

### Backend (`apps/backend`)

No requiere `.env`. TypeORM ya está configurado para crear/usar `data/inventario.db`. Si necesitas datos iniciales, pobla la tabla `espacio` antes de ejecutar las Tools.

### MCP Server (`apps/mcp-server`)

Opcionalmente puedes crear `.env` para sobreescribir valores (p. ej. `PORT`). Por defecto utiliza:

- Puerto: `3001`
- Backend URL: `http://localhost:3002` (ver `src/services/backend-client.ts`)

### API Gateway (`apps/api-gateway`)

Crea un archivo `.env` con tu clave de Gemini:

```
GEMINI_API_KEY=TU_CLAVE_DE_GOOGLE_AI_STUDIO
MCP_SERVER_URL=http://localhost:3001
PORT=3000            # opcional, Nest usa 3000 por defecto
```

La variable `MCP_SERVER_URL` debe apuntar al servidor MCP accesible para el Gateway.

---

## Ejecución local

1. **Backend**

```bash
cd apps/backend
npm run start:dev
```

2. **MCP Server**

```bash
cd apps/mcp-server
npm run dev
```

3. **API Gateway**

```bash
cd apps/api-gateway
npm run start:dev
```

> Orden recomendado: backend → MCP → gateway. Verifica en consola que cada servicio levante sin errores.

---

## Tools MCP disponibles

| Tool                    | Descripción | Endpoint backend utilizado |
| ----------------------- | ----------- | -------------------------- |
| `buscar_espacio`        | Busca salas por nombre o fragmento. | `GET /espacios/buscar?nombre=` |
| `validar_disponibilidad`| Confirma si un espacio está libre entre dos fechas ISO. | `GET /reservas/disponibilidad` |
| `crear_reserva`         | Registra una reserva cuando la disponibilidad fue confirmada. | `POST /reservas` |

El API Gateway ejecuta estas Tools secuencialmente siguiendo las decisiones de Gemini. Logs del Gateway muestran cada `functionCall` recibido.

---

## Flujo E2E esperado

1. Usuario envía un prompt al endpoint del Gateway (`POST http://localhost:3000/api/procesar`).
2. El Gateway pregunta al MCP por `/tools` y abre un chat con Gemini, entregando las definiciones.
3. Gemini elige `buscar_espacio` para obtener IDs posibles.
4. Gemini llama `validar_disponibilidad` con el `espacioId` y el rango horario.
5. Si el rango está libre, Gemini solicita (o inventa) un `usuarioId` y ejecuta `crear_reserva`.
6. El Gateway transcribe el resultado a lenguaje natural y responde.

Ejemplo de petición manual:

```bash
curl -X POST http://localhost:3000/api/procesar \
  -H "Content-Type: application/json" \
  -d '{
    "mensaje": "Quiero reservar el Auditorio FCVT para el próximo lunes de 14:00 a 16:00"
  }'
```

---

## Pruebas

| Servicio      | Comando principal |
| ------------- | ----------------- |
| Backend       | `npm run test`, `npm run test:e2e` |
| API Gateway   | `npm run test` (ajusta/añade specs según tus necesidades) |
| MCP Server    | No tiene pruebas automatizadas aún; se recomienda cubrir las Tools con Jest + supertest |

Además, captura las pruebas manuales (Postman/Thunder Client) según la rúbrica del taller.

---

## Solución de problemas

- **Gemini responde que falta el MCP Server**: confirma que `MCP_SERVER_URL` apunta a `http://localhost:3001` y que `npm run dev` está activo en `apps/mcp-server`.
- **Errores 500 al crear reservas**: verifica que el backend esté corriendo, que existan espacios con `estado = DISPONIBLE` y que los rangos de fecha estén en ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- **TLS Warning en gateway**: revisa que no estés modificando `NODE_TLS_REJECT_UNAUTHORIZED`. Evita deshabilitar la verificación salvo en entornos de prueba controlados.

---

