import { z } from 'zod';
import { Tool } from './tool.interface';
import { backendClient, handleAxiosError } from '../services/backend-client';

export const crearReservaTool: Tool = {
  name: 'crear_reserva',
  description: 'Registra una nueva reserva confirmada en la base de datos. Úsalo SOLAMENTE si la validación de disponibilidad fue exitosa.',
  
  schema: z.object({
    espacioId: z.string().uuid(),
    usuarioId: z.string().describe('ID del usuario que reserva (puede ser un string genérico si no se conoce)'),
    fechaInicio: z.string().datetime(),
    fechaFin: z.string().datetime()
  }),
  parameters: {
    type: 'object',
    properties: {
      espacioId: { type: 'string', description: 'UUID del espacio a reservar' },
      usuarioId: { type: 'string', description: 'Identificador del usuario solicitante' },
      fechaInicio: { type: 'string', description: 'Inicio en ISO 8601' },
      fechaFin: { type: 'string', description: 'Fin en ISO 8601' }
    },
    required: ['espacioId', 'usuarioId', 'fechaInicio', 'fechaFin']
  },

  execute: async (params) => {
    try {
      console.log(` Ejecutando Tool: crear_reserva`);
      
      const response = await backendClient.post('/reservas', {
        espacioId: params.espacioId,
        usuarioId: params.usuarioId,
        fechaInicio: params.fechaInicio,
        fechaFin: params.fechaFin
      });
      
      return {
        mensaje: "Reserva creada con éxito",
        datos: response.data
      };
    } catch (error) {
      handleAxiosError(error);
    }
  }
};