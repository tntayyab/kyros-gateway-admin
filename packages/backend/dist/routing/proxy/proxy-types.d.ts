import type { IncomingHttpHeaders } from 'http';
import type { RecordingResponseBody } from './attempt-recording.types';
import { ProviderEndpoint } from './provider-endpoints';
import type { AttemptRecordingCapture } from './attempt-recording-capture';
import type { ThinkingBlock, ThinkingBlockRouteContext } from './thinking-block-cache';
import { CallerAttribution } from './caller-classifier';
export type SignatureLookup = (toolCallId: string) => string | null;
export type ThinkingBlockLookup = (firstToolUseId: string, routeContext?: ThinkingBlockRouteContext) => ThinkingBlock[] | null;
export type ProxyApiMode = 'chat_completions' | 'responses' | 'messages';
export type ResolveChatBody = () => Promise<Record<string, unknown>>;
export type ProviderWireFormat = 'openai_chat_completions' | 'openai_responses' | 'anthropic_messages' | 'google_generate_content' | 'google_code_assist' | 'kiro_chat';
export interface ProviderAttemptRecordingStart {
    requestBody: Record<string, unknown>;
    wireFormat: ProviderWireFormat;
}
export interface ProviderAttemptStart {
    provider: string;
    model: string;
    authType?: string;
    tenantProviderId?: string | null;
    providerCallStarted?: boolean;
    keyLabel?: string;
}
export interface ProviderAttemptRef {
    id: string;
    attemptNumber: number;
    startedAtMs: number;
    startedAt: string;
    completedAtMs?: number;
    pendingWrite: Promise<boolean>;
    completeFailure?: (failure: {
        status: number;
        errorBody: string;
        superseded: boolean;
    }) => Promise<void>;
    recordingCapture?: AttemptRecordingCapture;
    startRecording?: (recording: ProviderAttemptRecordingStart) => void;
    finishRecording?: (response?: RecordingResponseBody | null) => Promise<void>;
}
export type StartProviderAttempt = (attempt: ProviderAttemptStart) => ProviderAttemptRef;
export interface OpenAIMessage {
    role: string;
    content?: unknown;
    tool_calls?: Array<{
        id: string;
        type: string;
        function: {
            name: string;
            arguments: string;
        };
    }>;
    tool_call_id?: string;
    [key: string]: unknown;
}
export interface ForwardOptions {
    provider: string;
    apiKey: string;
    model: string;
    body: Record<string, unknown>;
    resolveChatBody?: ResolveChatBody;
    apiMode?: ProxyApiMode;
    sessionKey?: string;
    providerCacheKey?: string;
    stream: boolean;
    signal?: AbortSignal;
    extraHeaders?: Record<string, string>;
    customEndpoint?: ProviderEndpoint;
    authType?: string;
    signatureLookup?: SignatureLookup;
    thinkingLookup?: ThinkingBlockLookup;
    thinkingRouteContext?: ThinkingBlockRouteContext;
    clientAnthropicBeta?: string | string[];
    providerResource?: string;
    attempt?: ProviderAttemptRef;
}
export interface ProxyRequestOptions {
    agentId: string;
    tenantId: string;
    userId: string | null;
    body: Record<string, unknown>;
    routingBody?: Record<string, unknown>;
    apiMode?: ProxyApiMode;
    sessionKey: string;
    sessionCacheKey: string;
    providerCacheKey?: string;
    sessionMomentumKey?: string;
    agentName?: string;
    signal?: AbortSignal;
    specificityOverride?: string;
    callerAttribution?: CallerAttribution | null;
    headers?: IncomingHttpHeaders;
    startProviderAttempt?: StartProviderAttempt;
}
