import { Tool } from './tool.interface';
import { buscarEspacioTool } from './buscar-espacio.tool';
import { validarDisponibilidadTool } from './validar-disponibilidad.tool';
import { crearReservaTool } from './crear-reserva.tool';

export const toolsRegistry: Record<string, Tool> = {
  [buscarEspacioTool.name]: buscarEspacioTool,
  [validarDisponibilidadTool.name]: validarDisponibilidadTool,
  [crearReservaTool.name]: crearReservaTool,
};

export const getToolsDefinitions = () =>
  Object.values(toolsRegistry).map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters ?? {
      type: 'object',
      properties: {},
      required: [],
    },
  }));