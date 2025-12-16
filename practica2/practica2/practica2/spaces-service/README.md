# Espacios Service

Este microservicio es responsable de gestionar los espacios disponibles en la aplicación. Proporciona funcionalidades para crear, leer, actualizar y eliminar espacios, así como para publicar eventos relacionados con los cambios en los espacios.

## Estructura del Proyecto

- **src/**: Contiene el código fuente del microservicio.
  - **main.ts**: Punto de entrada de la aplicación.
  - **app.module.ts**: Módulo principal que importa otros módulos.
  - **spaces/**: Módulo que agrupa los componentes relacionados con los espacios.
    - **spaces.controller.ts**: Controlador que maneja las rutas relacionadas con los espacios.
    - **spaces.service.ts**: Servicio que contiene la lógica de negocio para los espacios.
    - **dto/**: Contiene los Data Transfer Objects (DTOs) utilizados en el microservicio.
    - **entities/**: Contiene las entidades que representan los modelos de datos en la base de datos.
  - **events/**: Contiene la lógica para la publicación de eventos relacionados con los espacios.
  - **config/**: Contiene la configuración de la base de datos y otros parámetros de configuración.

## Requisitos

- Node.js
- NestJS
- Prisma
- PostgreSQL

## Instalación

1. Clona el repositorio.
2. Navega al directorio `spaces-service`.
3. Instala las dependencias:

   npm install

4. Configura las variables de entorno en un archivo `.env` basado en el archivo `.env.example`.
5. Ejecuta las migraciones de la base de datos:

   npx prisma migrate dev

6. Inicia el servicio:

   npm run start:dev

## Comunicación entre Servicios

Este microservicio se comunica con otros microservicios a través de eventos y mensajes. Utiliza RabbitMQ para la mensajería y Prisma para la interacción con la base de datos.

## Docker

El microservicio puede ser ejecutado en un contenedor Docker. Asegúrate de tener Docker y Docker Compose instalados. Para construir y ejecutar el contenedor, utiliza:

docker-compose up --build

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para discutir cambios.

## Licencia

Este proyecto está bajo la Licencia MIT.