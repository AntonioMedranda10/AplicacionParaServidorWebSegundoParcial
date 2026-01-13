import { z } from 'zod';
import { Tool } from './tool.interface';
import { backendClient, handleAxiosError } from '../services/backend-client';

export const validarDisponibilidadTool: Tool = {
  name: 'validar_disponibilidad',
  description: 'Verifica si un espacio está libre en un rango de fechas. Retorna true si está libre.',
  
  schema: z.object({
    espacioId: z.string().uuid().describe('ID único del espacio a verificar'),
    inicio: z.string().datetime().describe('Fecha y hora de inicio en formato ISO 8601'),
    fin: z.string().datetime().describe('Fecha y hora de fin en formato ISO 8601')
  }),
  parameters: {
    type: 'object',
    properties: {
      espacioId: {
        type: 'string',
        description: 'UUID del espacio a validar'
      },
      inicio: {
        type: 'string',
        description: 'Fecha inicial en ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)'
      },
      fin: {
        type: 'string',
        description: 'Fecha final en ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)'
      }
    },
    required: ['espacioId', 'inicio', 'fin']
  },

  execute: async (params) => {
    try {
      console.log(`Checking Ejecutando Tool: validar_disponibilidad para espacio ${params.espacioId}`);
      
      const response = await backendClient.get('/reservas/disponibilidad', {
        params: {
          espacioId: params.espacioId,
          inicio: params.inicio,
          fin: params.fin
        }
      });
      
      // El backend retorna { disponible: boolean }
      return response.data;
    } catch (error) {
      handleAxiosError(error);
    }
  }
};