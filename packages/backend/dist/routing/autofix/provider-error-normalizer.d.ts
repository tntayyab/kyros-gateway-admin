import type { PhoenixProviderError } from './phoenix.types';
export declare function normalizeProviderError(rawBody: string): PhoenixProviderError;
export declare function serializeProviderError(error: PhoenixProviderError): string;
