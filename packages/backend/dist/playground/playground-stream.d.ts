import type { ForwardResult, ProviderClient } from '../routing/proxy/provider-client';
import { type StreamUsage } from '../routing/proxy/stream-writer';
export interface ConsumeStreamResult {
    content: string;
    usage: StreamUsage | null;
    ttftMs: number | null;
    totalMs: number;
}
export declare function consumeProviderStream(body: ReadableStream<Uint8Array>, forward: Pick<ForwardResult, 'isGoogle' | 'isAnthropic' | 'isChatGpt' | 'isCodeAssist'>, model: string, providerClient: ProviderClient, onDelta: (text: string) => void, startedAt: number): Promise<ConsumeStreamResult>;
