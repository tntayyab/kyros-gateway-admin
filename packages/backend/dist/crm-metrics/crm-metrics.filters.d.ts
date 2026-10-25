export declare function isExcludedEmail(email: string): boolean;
export declare function domainOf(email: string): string;
export declare function isConsumerEmail(email: string): boolean;
export declare function isCorporateSignupEmail(email: string): boolean;
export interface ClusterCandidate {
    signed_up_at: string;
    has_traffic: boolean;
}
export declare function isSignupCluster(signups: ClusterCandidate[]): boolean;
export declare function isMachineGeneratedDomain(localParts: string[]): boolean;
