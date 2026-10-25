import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { type AuthType } from 'manifest-shared';
import { Agent } from '../../entities/agent.entity';
import type { ForwardResult } from '../proxy/provider-client';
import type { ProxyApiMode } from '../proxy/proxy-types';
import { type HealingClient, type HealingRequestContext } from './healing-client';
import type { AutofixRecord } from './autofix.types';
export interface MaybeHealParams {
    forward: ForwardResult;
    agentId: string;
    tenantId: string;
    provider: string;
    model: string;
    authType: AuthType;
    apiMode: ProxyApiMode;
    requestBody: Record<string, unknown>;
    url?: string;
    reforward: (healedBody: Record<string, unknown>) => Promise<ForwardResult>;
}
export interface AutofixAttempt {
    forward: ForwardResult;
    record: AutofixRecord;
}
export declare class AutofixService {
    private readonly client;
    private readonly agentRepo;
    private readonly logger;
    private readonly globalEnabled;
    private readonly defaultAgentEnabled;
    private readonly repairableStatuses;
    private readonly configLoads;
    private configLoadGeneration;
    private healFailureStreak;
    private breakerOpenUntil;
    constructor(client: HealingClient, agentRepo: Repository<Agent>, config: ConfigService);
    resolveEnabled(stored: boolean | null | undefined): boolean;
    isRepairable(status: number): boolean;
    isActiveFor(tenantId: string, agentId: string): Promise<boolean>;
    getHealingContext(tenantId: string, agentId: string): Promise<HealingRequestContext | null>;
    private recordHealSuccess;
    private recordHealFailure;
    maybeHeal(params: MaybeHealParams): Promise<AutofixAttempt | null>;
    private runHealOnce;
    private loadAgentConfig;
    private loadAgentConfigGeneration;
    private reportOutcome;
    private deliverOutcome;
}
