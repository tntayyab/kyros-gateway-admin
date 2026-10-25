import type { HealingClient, HealingRequestContext } from './healing-client';
import type { ConfirmResponse, HealOutcome, HealRequest, HealResponse } from './phoenix.types';
export declare const MOCK_RENAME_CATALOG: Record<string, string>;
export declare class MockHealingClient implements HealingClient {
    private readonly logger;
    heal(input: HealRequest, _context: HealingRequestContext): Promise<HealResponse>;
    observe(observations: HealRequest[], _context: HealingRequestContext): Promise<void>;
    reportOutcome(healAttemptId: string, outcome: HealOutcome, _context: HealingRequestContext): Promise<ConfirmResponse | null>;
}
