import { GeminiService } from './gemini/gemini.service';
export declare class AppController {
    private readonly geminiService;
    constructor(geminiService: GeminiService);
    procesar(mensaje: string): Promise<{
        error: string;
        respuesta_ia?: undefined;
    } | {
        respuesta_ia: any;
        error?: undefined;
    }>;
}
