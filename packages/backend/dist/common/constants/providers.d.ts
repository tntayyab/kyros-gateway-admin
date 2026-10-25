import { type SharedProviderEntry } from 'manifest-shared';
export type ProviderRegistryEntry = SharedProviderEntry;
export declare const PROVIDER_REGISTRY: readonly ProviderRegistryEntry[];
export declare const PROVIDER_BY_ID: ReadonlyMap<string, ProviderRegistryEntry>;
export declare const PROVIDER_BY_ID_OR_ALIAS: ReadonlyMap<string, ProviderRegistryEntry>;
export declare const OPENROUTER_PREFIX_TO_PROVIDER: ReadonlyMap<string, string>;
export declare const ALL_PROVIDER_IDS: ReadonlySet<string>;
export declare function expandProviderNames(names: Iterable<string>): Set<string>;
