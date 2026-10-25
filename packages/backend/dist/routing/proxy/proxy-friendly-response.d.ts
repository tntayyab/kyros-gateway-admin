import { ConfigService } from '@nestjs/config';
import { Response as ExpressResponse } from 'express';
import { Tier } from '../../scoring/types';
import type { ResponseMode } from 'manifest-shared';
import type { ManifestErrorCode } from '../../common/errors/error-codes';
export interface FriendlyForward {
    response: Response;
    isGoogle: false;
    isAnthropic: false;
    isChatGpt: false;
}
export interface FriendlyResult {
    forward: FriendlyForward;
    meta: {
        tier: Tier;
        model: string;
        provider: string;
        confidence: number;
        reason: string;
        response_mode: ResponseMode;
        manifest_error_code?: ManifestErrorCode;
        manifest_error_message?: string;
    };
}
export type DashboardSection = 'routing' | 'limits';
export declare function getDashboardUrl(config: ConfigService, agentName?: string, section?: DashboardSection): string;
export declare function buildFriendlyResponse(content: string, stream: boolean, reason?: string, errorCode?: ManifestErrorCode): FriendlyResult;
export declare function sendFriendlyResponse(res: ExpressResponse, content: string, stream: boolean): void;
