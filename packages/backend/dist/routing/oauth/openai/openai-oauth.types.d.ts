export { isOAuthTokenBlob, oauthDoneHtml, parseOAuthTokenBlob, serializeOAuthTokenBlob, type OAuthTokenBlob, } from '../core';
export interface PendingOAuth {
    verifier: string;
    agentId: string;
    tenantId: string;
    createdByUserId: string | null;
    backendUrl: string;
    expiresAt: number;
}
