import { SignatureLookup } from './proxy-types';
export interface ExtractedSignature {
    toolCallId: string;
    signature: string;
}
export declare function toGoogleRequest(body: Record<string, unknown>, _model: string, signatureLookup?: SignatureLookup): Record<string, unknown>;
export declare function fromGoogleResponse(googleResp: Record<string, unknown>, model: string): Record<string, unknown> & {
    _extractedSignatures?: ExtractedSignature[];
};
export interface GoogleStreamChunkResult {
    chunk: string | null;
    signatures: ExtractedSignature[];
}
export interface GoogleStreamState {
    id: string;
    created: number;
    toolCallCount: number;
    usage?: Record<string, number>;
    finished: boolean;
    usageSent: boolean;
}
export declare function createGoogleStreamState(): GoogleStreamState;
export declare function transformGoogleStreamChunk(chunk: string, model: string, state?: GoogleStreamState): GoogleStreamChunkResult;
export declare function finishGoogleStream(state: GoogleStreamState, model: string): string | null;
