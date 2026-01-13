export declare class WebhookEmitterService {
    private readonly logger;
    private readonly n8nWebhookUrl;
    emit(evento: string, payload: any): Promise<void>;
}
