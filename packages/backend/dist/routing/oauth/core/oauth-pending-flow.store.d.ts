import { DataSource } from 'typeorm';
export interface OAuthPendingFlowInput {
    state: string;
    verifier: string;
    agentId: string;
    tenantId: string;
}
export interface OAuthPendingFlowRecord extends OAuthPendingFlowInput {
    provider: string;
    expiresAt: number;
}
export declare class OAuthPendingFlowStore {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    create(provider: string, input: OAuthPendingFlowInput, ttlMs: number): Promise<OAuthPendingFlowRecord>;
    consume(provider: string, state: string, agentId: string, tenantId: string): Promise<OAuthPendingFlowRecord | null>;
    findLatestForAgent(provider: string, agentId: string, tenantId: string): Promise<OAuthPendingFlowRecord | null>;
    clear(provider: string, state: string): Promise<void>;
    count(provider: string): Promise<number>;
    cleanupExpired(provider?: string): Promise<void>;
    cleanupExpiredCron(): Promise<void>;
}
