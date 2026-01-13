import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { toolsRegistry, getToolsDefinitions } from './tools/registry'; 

// Configuración básica
const app = express();
const PORT = 3001; 

// Middleware para entender JSON7
app.use(bodyParser.json());

// ---------------------------------------------------------
// ENDPOINT 1: Ejecución de Tools (JSON-RPC)
// ---------------------------------------------------------
// El Gateway (Gemini) enviará todas las solicitudes de ejecución a esta ruta
app.post('/mcp', async (req: Request, res: Response): Promise<any> => {
  console.log('📨 Petición MCP recibida:', req.body);

  const { jsonrpc, method, params, id } = req.body;

  // 1. Validación básica de JSON-RPC 2.0
  if (jsonrpc !== '2.0' || !method) {
    return res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Invalid Request' },
      id: id || null,
    });
  }

  try {
    // 2. Despachador de Métodos (Dispatcher Inteligente)
    let result;

    if (method === 'ping') {
      result = "¡Pong! El servidor MCP está vivo.";
    } 
    // Verificamos si la Tool solicitada existe en nuestro registro
    else if (toolsRegistry[method]) {
      const tool = toolsRegistry[method];
      
      // Validamos los parámetros con Zod antes de ejecutar (Seguridad)
      const validation = tool.schema.safeParse(params);
      
      if (!validation.success) {
        console.warn(`⚠️ Error de validación en tool ${method}:`, validation.error);
        return res.status(400).json({
          jsonrpc: '2.0',
          error: { 
            code: -32602, 
            message: 'Invalid params', 
            data: validation.error.format() 
          },
          id
        });
      }

      // Ejecutamos la herramienta (que a su vez llama al Backend NestJS)
      result = await tool.execute(validation.data);
      
    } else {
      // Método no encontrado
      return res.status(404).json({
        jsonrpc: '2.0',
        error: { code: -32601, message: `Method '${method}' not found` },
        id,
      });
    }

    // 3. Respuesta Exitosa
    return res.json({
      jsonrpc: '2.0',
      result: result,
      id: id,
    });

  } catch (error: any) {
    // Manejo de errores internos
    console.error('💥 Error interno:', error);
    return res.status(500).json({
      jsonrpc: '2.0',
      error: { code: -32603, message: 'Internal Error', data: error.message },
      id,
    });
  }
});

// ---------------------------------------------------------
// ENDPOINT 2: Descubrimiento de Tools
// ---------------------------------------------------------
// El Gateway llama aquí para saber qué herramientas ofrecerle a Gemini
app.get('/tools', (req: Request, res: Response) => {
  const tools = getToolsDefinitions();
  res.json(tools);
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 MCP Server corriendo en http://localhost:${PORT}`);
  console.log(`📡 Esperando peticiones JSON-RPC en /mcp`);
  console.log(`📋 Definiciones de tools disponibles en /tools`);
});