import type { AuthType, ModelRoute } from 'manifest-shared';
import type { DiscoveredModel } from '../../model-discovery/model-fetcher';
export interface ModelRouteScope {
    provider?: string;
    authType?: AuthType;
    keyLabel?: string | null;
}
export type UnresolvedReason = 'not_found' | 'wrong_provider' | 'wrong_auth_type' | 'ambiguous';
export type ModelRouteResolution = {
    ok: true;
    route: ModelRoute;
} | {
    ok: false;
    reason: UnresolvedReason;
};
export type FallbackRoutesResolution = {
    ok: true;
    routes: ModelRoute[];
} | {
    ok: false;
    model: string;
};
export declare function matchesModelName(model: DiscoveredModel, name: string): boolean;
export declare function resolveModelRoute(name: string, available: readonly DiscoveredModel[], scope?: ModelRouteScope): ModelRouteResolution;
export declare function resolveFallbackRoutes(models: readonly string[], available: readonly DiscoveredModel[], routes?: readonly ModelRoute[], storedRoutes?: readonly ModelRoute[] | null): FallbackRoutesResolution;
export declare function describeUnresolvedFallback(model: string): string;
export declare function describeUnresolvedModel(name: string, reason: UnresolvedReason, available: readonly DiscoveredModel[], scope?: Pick<ModelRouteScope, 'provider' | 'authType'>): string;
