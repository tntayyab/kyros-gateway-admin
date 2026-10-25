import { Repository } from 'typeorm';
import { AgentMessage } from '../../entities/agent-message.entity';
import type { CallerAttribution } from '../../routing/proxy/caller-classifier';
import type { PhoenixExplanation, PhoenixOperation } from '../../routing/autofix/phoenix.types';
import { type AutofixStatus, type RequestParamDefaults } from 'manifest-shared';
import { ManifestRequest } from '../../entities/request.entity';
import type { RecordingResponseBody } from '../../routing/proxy/attempt-recording.types';
import { RequestRecordingStorageService } from '../../common/services/request-recording-storage.service';
export interface MessageDetailResponse {
    message: {
        id: string;
        timestamp: string;
        agent_name: string | null;
        model: string | null;
        status: string;
        autofix_status: AutofixStatus | null;
        error_message: string | null;
        error_code: string | null;
        error_http_status: number | null;
        error_origin: string | null;
        error_class: string | null;
        superseded: boolean;
        description: string | null;
        service_type: string | null;
        input_tokens: number;
        output_tokens: number;
        cache_read_tokens: number;
        cache_creation_tokens: number;
        cost_usd: number | null;
        duration_ms: number | null;
        trace_id: string | null;
        routing_tier: string | null;
        routing_reason: string | null;
        specificity_category: string | null;
        specificity_miscategorized: boolean;
        auth_type: string | null;
        provider_key_label: string | null;
        skill_name: string | null;
        fallback_from_model: string | null;
        fallback_index: number | null;
        session_key: string | null;
        feedback_rating: string | null;
        feedback_tags: string[] | null;
        feedback_details: string | null;
        request_headers: Record<string, string> | null;
        request_params: RequestParamDefaults | null;
        caller_attribution: CallerAttribution | null;
        header_tier_id: string | null;
        header_tier_name: string | null;
        header_tier_color: string | null;
        autofix_applied: boolean;
        autofix_role: string | null;
        autofix_operations: PhoenixOperation[] | null;
        autofix_decision: {
            status: string | null;
            issueId: string | null;
            patchId: string | null;
            healAttemptId: string | null;
            explanation?: PhoenixExplanation | null;
        } | null;
        autofix_sibling: {
            id: string;
            role: string | null;
            status: string;
        } | null;
        attempts?: Array<{
            id: string;
            model: string | null;
            provider: string | null;
            status: string;
            auth_type: string | null;
            error_message: string | null;
            error_origin: string | null;
            error_class: string | null;
            error_http_status: number | null;
            duration_ms: number | null;
            cost_usd: number | null;
            input_tokens: number;
            output_tokens: number;
            fallback_from_model: string | null;
            fallback_index: number | null;
            request_headers: Record<string, string> | null;
            request_params: object | null;
            autofix_applied: boolean;
            autofix_role: string | null;
            autofix_operations: object | null;
            autofix_decision: object | null;
            recording: AttemptRecordingDetail | null;
        }>;
    };
}
export interface AttemptRecordingDetail {
    request_body: Record<string, unknown>;
    response_body: RecordingResponseBody | null;
    wire_format: string;
}
export declare class MessageDetailsService {
    private readonly messageRepo;
    private readonly requestRepo?;
    private readonly recordingStorage?;
    private readonly logger;
    constructor(messageRepo: Repository<AgentMessage>, requestRepo?: Repository<ManifestRequest> | undefined, recordingStorage?: RequestRecordingStorageService | undefined);
    getDetails(messageId: string, tenantId: string | null): Promise<MessageDetailResponse>;
    private loadAttemptRecordings;
    private loadRecording;
    private findAutofixSibling;
}
