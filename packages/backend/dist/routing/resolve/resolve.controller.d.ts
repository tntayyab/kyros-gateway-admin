import { Request } from 'express';
import { IngestionContext } from '../../otlp/interfaces/ingestion-context.interface';
import { ResolveService } from './resolve.service';
import { ProviderService } from '../routing-core/provider.service';
import { ResolveRequestDto } from '../dto/resolve-request.dto';
import { ResolveResponse } from '../dto/resolve-response';
export declare class SubscriptionProviderItem {
    provider: string;
    token?: string;
}
export declare class RegisterSubscriptionsDto {
    providers: SubscriptionProviderItem[];
}
export declare class ResolveController {
    private readonly resolveService;
    private readonly providerService;
    constructor(resolveService: ResolveService, providerService: ProviderService);
    resolve(body: ResolveRequestDto, req: Request & {
        ingestionContext: IngestionContext;
    }): Promise<ResolveResponse>;
    registerSubscriptions(body: RegisterSubscriptionsDto, req: Request & {
        ingestionContext: IngestionContext;
    }): Promise<{
        registered: number;
    }>;
}
