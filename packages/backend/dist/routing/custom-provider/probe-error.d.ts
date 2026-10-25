export type ProbeFailureKind = 'connection_refused' | 'timeout' | 'dns_failure' | 'tls_mismatch' | 'not_found' | 'non_json' | 'unauthorized' | 'empty_models' | 'bad_status' | 'unknown';
export interface ProbeError {
    kind: ProbeFailureKind;
    message: string;
}
interface ClassifyInput {
    url: string;
    error?: Error | {
        name?: string;
        message?: string;
        code?: string;
    } | null;
    status?: number;
    contentType?: string;
    emptyModels?: boolean;
}
export declare function classifyProbeError(input: ClassifyInput): ProbeError;
export {};
