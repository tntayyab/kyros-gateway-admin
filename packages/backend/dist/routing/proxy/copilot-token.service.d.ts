export declare class CopilotTokenService {
    private readonly logger;
    private readonly cache;
    getCopilotToken(githubToken: string): Promise<string>;
    private evictExpired;
    private exchange;
}
