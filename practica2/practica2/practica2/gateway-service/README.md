# Gateway Service

Este servicio actúa como el punto de entrada para las solicitudes de los clientes y se encarga de enrutar las peticiones a los microservicios correspondientes: `espacios-service` y `reservas-service`.

## Estructura del Proyecto

El servicio está estructurado de la siguiente manera:

- **src/**: Contiene el código fuente del servicio.
  - **api/**: Define los controladores y rutas del servicio.
  - **clients/**: Clientes para interactuar con otros microservicios.
  - **common/**: Contiene filtros e interceptores comunes.
  - **config/**: Configuraciones específicas del servicio.

## Requisitos

- Node.js 14 o superior
- NestJS
- Docker y Docker Compose para la orquestación de servicios

## Instalación

1. Clona el repositorio:
   ```
   git clone <url-del-repositorio>
   cd gateway-service
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Configura las variables de entorno en un archivo `.env` basado en el archivo `.env.example`.

## Ejecución

Para ejecutar el servicio, utiliza el siguiente comando:
```
npm run start:dev
```

## Docker

Para construir y ejecutar el servicio en un contenedor Docker, utiliza:
```
docker-compose up --build
```

## Comunicación entre Servicios

El `gateway-service` se comunica con los microservicios `espacios-service` y `reservas-service` a través de HTTP y eventos utilizando RabbitMQ.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para discutir cambios.

## Licencia

Este proyecto está bajo la Licencia MIT.