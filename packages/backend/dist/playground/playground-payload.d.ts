import type { RunPlaygroundDto } from './dto/run-playground.dto';
export declare function buildForwardBody(dto: RunPlaygroundDto): Record<string, unknown>;
export declare function derivePromptForHistory(dto: RunPlaygroundDto): string;
