import type { AuthType } from './auth-types';
export interface ModelRoute {
    provider: string;
    authType: AuthType;
    model: string;
    keyLabel?: string | null;
}
export declare function routeEquals(a: ModelRoute | null | undefined, b: ModelRoute | null | undefined): boolean;
export declare function isModelRoute(value: unknown): value is ModelRoute;
export declare function isModelRouteArray(value: unknown): value is ModelRoute[];
export interface LegacyOverrideTriple {
    model: string | null;
    provider: string | null;
    authType: AuthType | null;
}
/**
 * Build a ModelRoute from the legacy (model, provider, authType) triple.
 * Returns null if model is missing — provider/authType alone don't form a route.
 * This is lossless: every route that comes back round-trips identically through
 * routeToLegacy().
 */
export declare function legacyToRoute(triple: LegacyOverrideTriple): ModelRoute | null;
/**
 * Decompose a ModelRoute back into the legacy triple. Round-trips losslessly
 * with legacyToRoute().
 */
export declare function routeToLegacy(route: ModelRoute | null): LegacyOverrideTriple;
//# sourceMappingURL=model-route.d.ts.map