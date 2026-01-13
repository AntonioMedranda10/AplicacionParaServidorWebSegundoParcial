import { z } from 'zod';

// Definimos la estructura que debe tener CUALQUIER herramienta en nuestro sistema
export interface Tool {
  name: string;             // Nombre único para que la IA la invoque (ej: "buscar_espacio")
  description: string;      // Explicación para que la IA sepa CUÁNDO usarla
  schema: z.ZodObject<any>; // Esquema de validación de parámetros (Zod)
  parameters?: any;         // Representación JSON Schema para Gemini (si aplica)
  execute: (params: any) => Promise<any>; // La función que hace el trabajo real
}