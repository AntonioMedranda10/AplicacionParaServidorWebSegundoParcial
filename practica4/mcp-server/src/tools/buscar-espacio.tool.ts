import { z } from 'zod';
import { Tool } from './tool.interface';
import { backendClient, handleAxiosError } from '../services/backend-client';

export const buscarEspacioTool: Tool = {
  name: 'buscar_espacio',
  description: 'Busca espacios físicos (salas, auditorios) por nombre. Úsalo cuando el usuario pregunte por disponibilidad de un lugar específico.',
  
  // Definición estricta de parámetros con Zod
  schema: z.object({
    nombre: z.string().describe('El nombre o parte del nombre del espacio a buscar'),
  }),
  parameters: {
    type: 'object',
    properties: {
      nombre: {
        type: 'string',
        description: 'Nombre o fragmento del espacio (ej: Auditorio, Sala de reuniones)'
      }
    },
    required: ['nombre']
  },

  execute: async (params) => {
    try {
      console.log(`🔍 Ejecutando Tool: buscar_espacio con "${params.nombre}"`);
      // Llamada al Backend NestJS (Puerto 3002)
      const response = await backendClient.get(`/espacios/buscar`, {
        params: { nombre: params.nombre }
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error);
    }
  }
};