"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
let GeminiService = class GeminiService {
    genAI;
    model;
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        const mcpUrl = process.env.MCP_SERVER_URL;
        if (!apiKey)
            throw new Error('FATAL: GEMINI_API_KEY no definida.');
        if (!mcpUrl)
            throw new Error('FATAL: MCP_SERVER_URL no definida.');
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-2.5-flash'
        });
    }
    async procesarSolicitud(promptUsuario) {
        try {
            const toolsDefinitions = await this.fetchToolsFromMCP();
            console.log('🔍 DUMP DE TOOLS:');
            console.log(JSON.stringify(toolsDefinitions, null, 2));
            console.log(`🔧 Herramientas detectadas: ${toolsDefinitions.length}`);
            const chatSession = this.model.startChat({
                tools: toolsDefinitions.length > 0 ? [{ functionDeclarations: toolsDefinitions }] : undefined,
            });
            console.log(`🤖 Preguntando a Gemini: "${promptUsuario}"`);
            const fechaHoy = new Date().toLocaleString("es-ES", { timeZone: "America/Guayaquil" });
            const promptConContexto = `
        Instrucción del sistema: Hoy es ${fechaHoy}.
        Si el usuario usa términos relativos como "mañana", "hoy" o "el viernes", calcula la fecha exacta (YYYY-MM-DD) basándote en la fecha de hoy.
        
        Mensaje del usuario: ${promptUsuario}
      `;
            const initialExchange = await chatSession.sendMessage(promptConContexto);
            let response = initialExchange.response;
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
        }
        catch (error) {
            console.error('Error en GeminiService:', error);
            if (error.statusText)
                console.error('Google Status:', error.statusText);
            throw new common_1.InternalServerErrorException('Error procesando la solicitud con IA');
        }
    }
    async fetchToolsFromMCP() {
        try {
            const url = process.env.MCP_SERVER_URL;
            const response = await axios_1.default.get(`${url}/tools`);
            return response.data;
        }
        catch (error) {
            console.error('⚠️ No se pudo conectar con MCP Server.');
            return [];
        }
    }
    async executeToolOnMCP(toolName, args) {
        try {
            const url = process.env.MCP_SERVER_URL;
            const rpcPayload = { jsonrpc: '2.0', method: toolName, params: args, id: Date.now() };
            const response = await axios_1.default.post(`${url}/mcp`, rpcPayload);
            if (response.data.error)
                throw new Error(JSON.stringify(response.data.error));
            return response.data.result;
        }
        catch (error) {
            return { error: `Falló la ejecución: ${error.message}` };
        }
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map