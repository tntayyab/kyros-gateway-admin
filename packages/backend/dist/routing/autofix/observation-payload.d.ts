import type { ProviderWireFormat, ProxyApiMode } from '../proxy/proxy-types';
import type { AuthType } from 'manifest-shared';
import type { HealRequest } from './phoenix.types';
export declare const MAX_BODY_BYTES: number;
export declare function isReportableStatus(status: number): boolean;
export declare function scrubProviderUrl(raw: string): string;
export declare function scrubBody(body: Record<string, unknown>): Record<string, unknown> | null;
export interface ObservationInput {
    traceId: string;
    tenantId: string;
    agentId: string;
    provider: string;
    model: string;
    authType: AuthType;
    apiMode: ProxyApiMode;
    requestBody: Record<string, unknown>;
    providerWire?: {
        format: ProviderWireFormat;
        url?: string;
        body: Record<string, unknown>;
    };
    status: number;
    errorBody: string;
    responseTimeMs?: number;
}
export declare function toObservation(input: ObservationInput): HealRequest | null;
