export interface OnboardResult {
    projectId: string;
    tierId: string;
}
export declare class CodeAssistClientService {
    private readonly logger;
    onboard(accessToken: string): Promise<OnboardResult>;
    private waitForOperation;
    private callJson;
    private callOperation;
}
