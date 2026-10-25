import { ModelsDevSyncService } from '../../database/models-dev-sync.service';
import type { ReasoningModelCatalog } from './reasoning-format';
export declare class ModelsDevReasoningCatalog implements ReasoningModelCatalog {
    private readonly modelsDev?;
    constructor(modelsDev?: ModelsDevSyncService | undefined);
    isReasoningModel(endpointKey: string, model: string): boolean | undefined;
}
