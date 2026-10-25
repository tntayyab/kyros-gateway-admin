export declare class SetEmailProviderDto {
    provider: string;
    apiKey?: string;
    domain?: string;
    notificationEmail?: string;
}
export declare class TestEmailProviderDto {
    provider: string;
    apiKey: string;
    domain?: string;
    to: string;
}
export declare class TestSavedEmailProviderDto {
    to: string;
}
