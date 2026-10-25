import { type ProviderParamSpec } from './provider-params-spec';
import type { RequestParamDefaults } from './request-params';
/**
 * Snapshot which model parameters were effectively in play for a provider
 * attempt. Values are UI/storage values, not provider-specific serialized
 * wire fragments.
 */
export interface RequestParamsSnapshotInput {
    /** The inbound request body before model-param defaults are merged. */
    body: Record<string, unknown>;
    /** Saved params for the resolved route scope, if any. */
    modelParams: RequestParamDefaults | null | undefined;
    /** MPS catalog specs for the resolved provider/auth/model. */
    specs: readonly ProviderParamSpec[];
}
export declare function snapshotRequestParams(input: RequestParamsSnapshotInput): RequestParamDefaults | null;
//# sourceMappingURL=request-params-snapshot.d.ts.map