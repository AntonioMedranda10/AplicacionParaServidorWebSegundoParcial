export declare class GeminiService {
    private genAI;
    private model;
    constructor();
    procesarSolicitud(promptUsuario: string): Promise<any>;
    private fetchToolsFromMCP;
    private executeToolOnMCP;
}
