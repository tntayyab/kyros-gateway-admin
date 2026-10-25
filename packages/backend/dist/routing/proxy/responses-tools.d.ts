type JsonRecord = Record<string, unknown>;
export interface ResponsesToolName {
    name: string;
    namespace?: string;
}
export type ResponsesToolNames = ReadonlyMap<string, ResponsesToolName>;
export declare function responsesToolNames(tools: unknown): ResponsesToolNames;
export declare function chatToolName(item: JsonRecord, names: ResponsesToolNames): string;
export declare function chatTools(tools: unknown[], names: ResponsesToolNames): JsonRecord[];
export {};
