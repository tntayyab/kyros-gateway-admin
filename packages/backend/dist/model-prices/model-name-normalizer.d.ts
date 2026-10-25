export declare const GOOGLE_VARIANT_RE: RegExp;
export declare function stripGoogleVariant(name: string): string;
export declare function stripProviderPrefix(name: string): string;
export declare function stripDateSuffix(name: string): string;
export declare function buildAliasMap(canonicalNames: ReadonlyArray<string>): Map<string, string>;
export declare function normalizeDots(name: string): string;
export declare function resolveModelName(name: string, aliasMap: Map<string, string>): string | undefined;
