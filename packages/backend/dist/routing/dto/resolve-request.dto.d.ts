import { TIERS } from 'manifest-shared';
declare class MessageDto {
    role: string;
    content?: unknown;
}
export declare class ResolveRequestDto {
    messages: MessageDto[];
    tools?: Record<string, unknown>[];
    tool_choice?: unknown;
    max_tokens?: number;
    recentTiers?: Array<(typeof TIERS)[number]>;
    specificity?: string;
}
export {};
