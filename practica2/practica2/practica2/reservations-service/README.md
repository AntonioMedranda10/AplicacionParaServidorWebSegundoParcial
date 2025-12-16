# Reservations Service

Este microservicio es responsable de gestionar las reservas en el sistema. Se comunica con el microservicio de espacios para verificar la disponibilidad de los espacios y manejar las reservas de manera eficiente.

## Estructura del Proyecto

- **src/**: Contiene el código fuente del microservicio.
  - **main.ts**: Punto de entrada de la aplicación.
  - **app.module.ts**: Módulo principal que importa otros módulos.
  - **reservations/**: Contiene la lógica relacionada con las reservas.
    - **reservations.module.ts**: Módulo que agrupa los componentes del microservicio de reservas.
    - **reservations.controller.ts**: Controlador que maneja las rutas relacionadas con las reservas.
    - **reservations.service.ts**: Servicio que contiene la lógica de negocio para las reservas.
    - **dto/**: Contiene los Data Transfer Objects (DTOs).
      - **create-reservation.dto.ts**: DTO para la creación de una reserva.
    - **entities/**: Contiene las entidades que representan las reservas en la base de datos.
      - **reservation.entity.ts**: Entidad que representa una reserva.
  - **consumers/**: Contiene los consumidores de eventos.
    - **space-events.consumer.ts**: Consumidor de eventos para manejar mensajes de RabbitMQ.
  - **config/**: Contiene la configuración del microservicio.
    - **database.config.ts**: Configuración de la base de datos para el reservas-service.

## Instalación

1. Clona el repositorio.
2. Navega al directorio del microservicio de reservas:
   ```
   cd reservations-service
   ```
3. Instala las dependencias:
   ```
   npm install
   ```

## Ejecución

Para ejecutar el microservicio, utiliza el siguiente comando:
```
npm run start:dev
```

## Docker

Este microservicio puede ser ejecutado en un contenedor Docker. Asegúrate de tener Docker instalado y ejecuta:
```
docker build -t reservations-service .
docker run -p 3000:3000 reservations-service
```

## Comunicación entre Servicios

El microservicio de reservas se comunica con el microservicio de espacios a través de mensajes utilizando RabbitMQ. Asegúrate de que RabbitMQ esté corriendo y configurado correctamente.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para discutir cambios o mejoras.

## Licencia

Este proyecto está bajo la Licencia MIT.