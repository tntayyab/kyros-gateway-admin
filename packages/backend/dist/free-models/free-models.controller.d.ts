import { FreeModelsService } from './free-models.service';
export declare class FreeModelsController {
    private readonly freeModelsService;
    constructor(freeModelsService: FreeModelsService);
    getFreeModels(): import("./free-models.service").FreeModelsResponse;
}
