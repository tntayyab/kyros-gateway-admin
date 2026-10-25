export interface DeviceCodeResponse {
    device_code: string;
    user_code: string;
    verification_uri: string;
    expires_in: number;
    interval: number;
}
export type PollStatus = 'pending' | 'complete' | 'expired' | 'denied' | 'slow_down';
export declare class CopilotDeviceAuthService {
    private readonly logger;
    requestDeviceCode(): Promise<DeviceCodeResponse>;
    pollForToken(deviceCode: string): Promise<{
        status: PollStatus;
        token?: string;
    }>;
    private parsePollResponse;
}
