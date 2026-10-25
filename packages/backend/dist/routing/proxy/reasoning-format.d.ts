export interface OpenAiReasoningStreamFormat {
    outputStreamDeltaPaths: readonly string[];
    clientStreamDeltaPath: 'reasoning_content';
}
export interface NormalizedReasoningDelta {
    text: string;
    normalized: boolean;
}
export interface ReasoningModelCatalog {
    isReasoningModel(endpointKey: string, model: string): boolean | undefined;
}
export declare function supportsReasoningContent(endpointKey: string, model: string, catalog?: ReasoningModelCatalog): boolean;
export declare function getOpenAiReasoningStreamFormat(endpointKey: string, model: string, catalog?: ReasoningModelCatalog): OpenAiReasoningStreamFormat | null;
export declare function normalizeOpenAiReasoningDelta(delta: Record<string, unknown>, format: OpenAiReasoningStreamFormat): NormalizedReasoningDelta | null;
