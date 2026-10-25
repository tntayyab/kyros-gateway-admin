import { ModelPricesService } from './model-prices.service';
export declare class ModelPricesController {
    private readonly modelPricesService;
    constructor(modelPricesService: ModelPricesService);
    getModelPrices(): Promise<{
        models: {
            model_name: string;
            provider: string;
            input_price_per_million: number | null;
            output_price_per_million: number | null;
            display_name: string | null;
            validated: boolean | undefined;
        }[];
        lastSyncedAt: string | null;
    }>;
}
