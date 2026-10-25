export declare const DOMAIN_RE: RegExp;
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    normalized: {
        provider: string;
        apiKey: string;
        domain: string;
    };
}
export declare function validateProviderConfig(provider: string, apiKey: string, domain?: string): ValidationResult;
