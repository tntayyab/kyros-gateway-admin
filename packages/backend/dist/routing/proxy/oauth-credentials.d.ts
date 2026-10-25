import { OpenaiOauthService } from '../oauth/openai/openai-oauth.service';
import { MinimaxOauthService } from '../oauth/minimax/minimax-oauth.service';
import { AnthropicOauthService } from '../oauth/anthropic/anthropic-oauth.service';
import { GeminiOauthService } from '../oauth/gemini/gemini-oauth.service';
import { KiroOauthService } from '../oauth/kiro/kiro-oauth.service';
import { XaiOauthService } from '../oauth/xai/xai-oauth.service';
export interface OAuthServiceSet {
    openaiOauth: OpenaiOauthService;
    minimaxOauth: MinimaxOauthService;
    anthropicOauth: AnthropicOauthService;
    geminiOauth: GeminiOauthService;
    kiroOauth: KiroOauthService;
    xaiOauth: XaiOauthService;
}
export interface ResolvedCredentials {
    apiKey: string | null;
    resourceUrl?: string;
}
export declare function isRefreshableOAuthCredential(rawValue: string): boolean;
export declare function refreshRejectedOAuthCredential(provider: string, rawValue: string, agentId: string, tenantId: string, keyLabel: string | undefined, services: OAuthServiceSet): Promise<ResolvedCredentials | null>;
export declare function resolveApiKey(provider: string, apiKey: string, authType: string | undefined, agentId: string, tenantId: string, openaiOauth: OpenaiOauthService, minimaxOauth: MinimaxOauthService, anthropicOauth: AnthropicOauthService, geminiOauth: GeminiOauthService, kiroOauth: KiroOauthService, xaiOauth: XaiOauthService, keyLabel?: string): Promise<ResolvedCredentials>;
