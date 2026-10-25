import type { ConfirmResponse, HealOutcome, HealRequest, HealResponse } from './phoenix.types';
import type { AgentPlatform } from 'manifest-shared';
export interface HealingRequestContext {
    harness: AgentPlatform;
}
export interface HealingClient {
    heal(input: HealRequest, context: HealingRequestContext): Promise<HealResponse>;
    reportOutcome(healAttemptId: string, outcome: HealOutcome, context: HealingRequestContext): Promise<ConfirmResponse | null>;
    observe(observations: HealRequest[], context: HealingRequestContext): Promise<void>;
}
export declare const HEALING_CLIENT: unique symbol;
export declare class HealContractError extends Error {
    readonly status: number;
    constructor(status: number, message: string);
}
