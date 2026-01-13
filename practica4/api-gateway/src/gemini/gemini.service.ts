import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    const mcpUrl = process.env.MCP_SERVER_URL;

    // Validación Fail Fast
    if (!apiKey) throw new Error('FATAL: GEMINI_API_KEY no definida.');
    if (!mcpUrl) throw new Error('FATAL: MCP_SERVER_URL no definida.');

    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // CONFIGURACIÓ:
    
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash'
    });
  }

  async procesarSolicitud(promptUsuario: string) {
    try {
      // 1. Detectar herramientas
      const toolsDefinitions = await this.fetchToolsFromMCP();
      
      console.log('🔍 DUMP DE TOOLS:');
      console.log(JSON.stringify(toolsDefinitions, null, 2)); // <--- ESTO NOS DIRÁ LA VERDAD
      // -------------------
      console.log(`🔧 Herramientas detectadas: ${toolsDefinitions.length}`);

      // 2. Iniciar Chat
      const chatSession = this.model.startChat({
        // Protección: Si no hay tools, enviamos undefined para que no falle
        tools: toolsDefinitions.length > 0 ? [{ functionDeclarations: toolsDefinitions }] : undefined,
      });

      console.log(`🤖 Preguntando a Gemini: "${promptUsuario}"`);
      // --- BLOQUE NUEVO: INYECCIÓN DE CONTEXTO ---
      // Obtenemos la fecha y hora actual en formato legible
      const fechaHoy = new Date().toLocaleString("es-ES", { timeZone: "America/Guayaquil" }); 
      // (O usa "America/Mexico_City" o tu zona horaria preferida)

      // Creamos un "prompt enriquecido" que le dice a la IA qué día es
      const promptConContexto = `
        Instrucción del sistema: Hoy es ${fechaHoy}.
        Si el usuario usa términos relativos como "mañana", "hoy" o "el viernes", calcula la fecha exacta (YYYY-MM-DD) basándote en la fecha de hoy.
        
        Mensaje del usuario: ${promptUsuario}
      `;
      // -------------------------------------------
      
      // 3. Enviar mensaje inicial
      const initialExchange = await chatSession.sendMessage(promptConContexto);
      let response = initialExchange.response;

      // 4. Loop hasta que Gemini deje de pedir herramientas
      while (true) {
        const functionCalls = response.functionCalls?.() ?? [];

        if (functionCalls.length === 0) {
          return response.text();
        }

        for (const functionCall of functionCalls) {
          console.log(`⚡ Gemini decidió usar la tool: ${functionCall.name}`);
          const toolResult = await this.executeToolOnMCP(functionCall.name, functionCall.args);

          console.log('🔄 Enviando resultado a Gemini para siguiente decisión...');
          const toolFeedback = await chatSession.sendMessage([
            {
              functionResponse: {
                name: functionCall.name,
                response: {
                  result: toolResult,
                },
              },
            },
          ]);

          response = toolFeedback.response;
        }
      }

    } catch (error: any) {
      console.error('Error en GeminiService:', error);
      // Imprimir detalle si Google nos da una razón
      if (error.statusText) console.error('Google Status:', error.statusText);
      throw new InternalServerErrorException('Error procesando la solicitud con IA');
    }
  }

  private async fetchToolsFromMCP() {
    try {
      const url = process.env.MCP_SERVER_URL; 
      const response = await axios.get(`${url}/tools`);
      return response.data;
    } catch (error) {
      console.error('⚠️ No se pudo conectar con MCP Server.');
      return []; 
    }
  }

  private async executeToolOnMCP(toolName: string, args: any) {
    try {
      const url = process.env.MCP_SERVER_URL;
      const rpcPayload = { jsonrpc: '2.0', method: toolName, params: args, id: Date.now() };
      const response = await axios.post(`${url}/mcp`, rpcPayload);
      if (response.data.error) throw new Error(JSON.stringify(response.data.error));
      return response.data.result;
    } catch (error: any) {
      return { error: `Falló la ejecución: ${error.message}` };
    }
  }
}