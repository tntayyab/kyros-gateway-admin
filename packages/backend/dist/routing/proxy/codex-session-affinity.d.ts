export interface CodexAffinityRequest {
    headers: Record<string, string>;
    storeKey?: string;
    incarnation?: number;
}
export declare class CodexSessionAffinity {
    private readonly sessions;
    private nextIncarnation;
    private lastCleanup;
    prepare(apiKey: string, requestBody: Record<string, unknown>): CodexAffinityRequest;
    capture(storeKey: string | undefined, response: Response, incarnation?: number): void;
    private getOrCreateSession;
    private createSession;
    private maybeCleanup;
}
