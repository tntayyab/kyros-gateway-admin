import { type HealingClient, type HealingRequestContext } from './healing-client';
import type { ConfirmResponse, HealOutcome, HealRequest, HealResponse } from './phoenix.types';
export type InstanceIdProvider = () => Promise<string>;
export declare class HttpHealingClient implements HealingClient {
    private readonly timeoutMs;
    private readonly apiKey?;
    private readonly instanceId?;
    private readonly manifestVersion?;
    private readonly logger;
    private readonly baseUrl;
    constructor(baseUrl: string, timeoutMs: number, apiKey?: string | undefined, instanceId?: InstanceIdProvider | undefined, manifestVersion?: string | undefined);
    heal(input: HealRequest, context: HealingRequestContext): Promise<HealResponse>;
    observe(observations: HealRequest[], context: HealingRequestContext): Promise<void>;
    reportOutcome(healAttemptId: string, outcome: HealOutcome, context: HealingRequestContext): Promise<ConfirmResponse | null>;
    private authenticatedFetch;
    private request;
    private instanceHeaders;
}
