"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CLASSES = exports.MANIFEST_ERROR_ORIGINS = exports.ERROR_ORIGINS = exports.ATTEMPT_STATUSES = exports.REQUEST_STATUSES = exports.FAILED_STATUS = exports.SUCCESS_STATUS = exports.CANCELLED_STATUS = exports.PENDING_STATUS = exports.SUPERSEDED_STATUSES = exports.AUTOFIX_ORIGINAL_STATUS = exports.SUPERSEDED_STATUS = exports.RATE_LIMITED_STATUS = exports.OK_STATUS = exports.TRANSPORT_TIMEOUT_HTTP_STATUS = exports.TRANSPORT_NETWORK_HTTP_STATUS = void 0;
exports.normalizeStatus = normalizeStatus;
exports.isSuccessStatus = isSuccessStatus;
exports.isFailedStatus = isFailedStatus;
exports.classifyHttpErrorClass = classifyHttpErrorClass;
exports.classifyMessageError = classifyMessageError;
exports.isManifestErrorOrigin = isManifestErrorOrigin;
const provider_error_semantics_1 = require("./provider-error-semantics");
/**
 * Error taxonomy for `agent_messages`.
 *
 * Historically a single `status` column answered three unrelated questions at
 * once (was it a success? who failed? was it a superseded attempt?), so a
 * missing-API-key config error and a provider 500 landed in the same `error`
 * bucket, and a recovered fallback attempt (`fallback_error`) looked like an
 * outcome. This module splits those into orthogonal axes:
 *
 *  - `error_origin` — WHO caused the failure (provider / transport / config /
 *    policy / internal).
 *  - `error_class`  — WHAT kind of failure it was. A rate limit is a *class* of
 *    error here, not a top-level status.
 *  - `superseded`   — whether this row is a retried / fell-back-away-from attempt
 *    rather than the request's terminal outcome (the old `fallback_error`).
 *
 * `classifyMessageError` is the single source of truth for live ingestion. The
 * original backfill migration mirrors its status-derived rules; provider-body
 * semantic overrides added later apply to newly recorded rows unless a dedicated
 * follow-up migration explicitly reclassifies history.
 */
/**
 * Synthetic HTTP codes the proxy stamps on non-HTTP transport failures
 * (see packages/backend/src/routing/proxy/proxy-transport.ts). A provider that
 * genuinely returns 503/504 is bucketed as `transport` too — an unreachable or
 * timed-out upstream is a transport-level condition regardless of who emitted
 * the code.
 */
exports.TRANSPORT_NETWORK_HTTP_STATUS = 503;
exports.TRANSPORT_TIMEOUT_HTTP_STATUS = 504;
/** Non-ok terminal/attempt statuses the proxy writes to `agent_messages.status`. */
exports.OK_STATUS = 'ok';
exports.RATE_LIMITED_STATUS = 'rate_limited';
/** A row that failed but was recovered by a later attempt (retry / fallback). */
exports.SUPERSEDED_STATUS = 'fallback_error';
/** The failed original of a healed Autofix flow — recovered by the retry row. */
exports.AUTOFIX_ORIGINAL_STATUS = 'auto_fixed';
/** Every status whose row is a recovered (superseded) attempt, not a terminal failure. */
exports.SUPERSEDED_STATUSES = [exports.SUPERSEDED_STATUS, exports.AUTOFIX_ORIGINAL_STATUS];
/**
 * Canonical outcome vocabulary for `requests.status` and `agent_messages.status`.
 *
 * The legacy `status` column conflated the outcome with the *reason* it failed
 * (`rate_limited`, `fallback_error`, `auto_fixed`). Those reasons now live on the
 * orthogonal axes — `error_class` (rate limit), `superseded` (recovered attempt),
 * and the `autofix_*` columns — so `status` carries only the terminal outcome:
 *
 *  - `pending` — accepted, no terminal outcome yet.
 *  - `cancelled` — the caller disconnected before a terminal provider outcome.
 *  - `success` — completed successfully (legacy `ok`).
 *  - `failed`  — completed without succeeding (legacy `error` / `rate_limited` /
 *    `fallback_error` / `auto_fixed`).
 *
 * Rolling-deploy note: during a deploy, old replicas still write the legacy
 * values while new replicas write these. Every reader must therefore compare
 * through `normalizeStatus` / `isSuccessStatus` / `isFailedStatus`, which accept
 * both vocabularies, until the backfill rewrites history and the compat window
 * closes. `classifyMessageError` is deliberately left legacy-aware so it can
 * still classify unnormalized historical rows.
 */
exports.PENDING_STATUS = 'pending';
exports.CANCELLED_STATUS = 'cancelled';
exports.SUCCESS_STATUS = 'success';
exports.FAILED_STATUS = 'failed';
exports.REQUEST_STATUSES = [
    exports.PENDING_STATUS,
    exports.CANCELLED_STATUS,
    exports.SUCCESS_STATUS,
    exports.FAILED_STATUS,
];
exports.ATTEMPT_STATUSES = [
    exports.PENDING_STATUS,
    exports.CANCELLED_STATUS,
    exports.SUCCESS_STATUS,
    exports.FAILED_STATUS,
];
/**
 * Collapse any status value — legacy (`ok`/`error`/`rate_limited`/
 * `fallback_error`/`auto_fixed`) or canonical — onto the canonical vocabulary.
 * A nullish value is treated as `success`, matching the legacy writer convention
 * where an absent status meant `ok`. Unknown non-null values fail closed.
 */
function normalizeStatus(status) {
    if (status === exports.PENDING_STATUS)
        return exports.PENDING_STATUS;
    if (status === exports.CANCELLED_STATUS)
        return exports.CANCELLED_STATUS;
    if (status == null || status === exports.OK_STATUS || status === exports.SUCCESS_STATUS)
        return exports.SUCCESS_STATUS;
    return exports.FAILED_STATUS;
}
/** True for a terminal success, whether stored as legacy `ok` or canonical `success`. */
function isSuccessStatus(status) {
    return normalizeStatus(status) === exports.SUCCESS_STATUS;
}
/** True for a terminal failure, whether stored as a legacy error value or canonical `failed`. */
function isFailedStatus(status) {
    return normalizeStatus(status) === exports.FAILED_STATUS;
}
exports.ERROR_ORIGINS = [
    'provider',
    'transport',
    'config',
    'policy',
    'internal',
    'request',
];
/**
 * Origins that are NOT a provider round-trip: Manifest rejected or
 * short-circuited the request before (or without) reaching a provider. These
 * are returned to the caller as HTTP 200 friendly stubs, so they must never
 * count as a "message" nor as a provider-reliability event.
 *
 * `request` is the caller's own fault (a malformed body Manifest refused to
 * route), which is neither the operator's setup (`config`), a limit they set
 * (`policy`), nor a Manifest bug (`internal`) — but it is still not a provider
 * failure, so it belongs here to stay out of `provider_error_rate`.
 */
exports.MANIFEST_ERROR_ORIGINS = ['config', 'policy', 'internal', 'request'];
exports.ERROR_CLASSES = [
    // provider (HTTP-derived)
    'rate_limit',
    'auth',
    'invalid_request',
    'not_found',
    'payload_too_large',
    'billing',
    'server_error',
    'client_error',
    // transport
    'timeout',
    'network',
    // manifest (config / policy / internal / request)
    'no_provider',
    'no_provider_key',
    'subscription_credentials_unusable',
    'local_provider_unavailable',
    'limit_exceeded',
    'plan_request_limit_exceeded',
    'internal',
];
/**
 * Canned `routing_reason` values the proxy writes for Manifest-originated stubs
 * (see proxy-message-recorder.ts). Their presence is the definitive signal that
 * a row is Manifest's own error, not a provider's.
 *
 * Every documented Manifest error code (`M###`, see
 * backend/src/common/errors/error-codes.ts) that can be attributed to an agent
 * maps onto exactly one reason here — `manifest-error.spec.ts` fails if a new
 * code ships without one.
 */
const MANIFEST_REASON_TO_CLASSIFICATION = {
    no_provider: { origin: 'config', errorClass: 'no_provider' },
    no_provider_key: { origin: 'config', errorClass: 'no_provider_key' },
    subscription_credentials_unusable: {
        origin: 'config',
        errorClass: 'subscription_credentials_unusable',
    },
    local_provider_unavailable: {
        origin: 'config',
        errorClass: 'local_provider_unavailable',
    },
    key_expired: { origin: 'config', errorClass: 'auth' },
    limit_exceeded: { origin: 'policy', errorClass: 'limit_exceeded' },
    plan_request_limit_exceeded: {
        origin: 'policy',
        errorClass: 'plan_request_limit_exceeded',
    },
    // Three distinct limits (per-user / per-IP / concurrency) that used to
    // collapse into `manifest_rate_limited`. That legacy reason stays mapped so
    // rows written before the split keep classifying.
    manifest_rate_limited: { origin: 'policy', errorClass: 'rate_limit' },
    manifest_ip_rate_limited: { origin: 'policy', errorClass: 'rate_limit' },
    manifest_concurrency_limited: { origin: 'policy', errorClass: 'rate_limit' },
    provider_cooldown: { origin: 'policy', errorClass: 'rate_limit' },
    manifest_invalid_request: { origin: 'request', errorClass: 'invalid_request' },
    model_not_available: { origin: 'request', errorClass: 'not_found' },
    manifest_internal_error: { origin: 'internal', errorClass: 'internal' },
    // Legacy alias of `manifest_internal_error`, kept for rows already written.
    friendly_error: { origin: 'internal', errorClass: 'internal' },
};
/** Map a provider's HTTP status code to a normalized error class. */
function classifyHttpErrorClass(httpStatus) {
    if (httpStatus === 429)
        return 'rate_limit';
    if (httpStatus === 402)
        return 'billing';
    if (httpStatus === 401 || httpStatus === 403)
        return 'auth';
    if (httpStatus === 404)
        return 'not_found';
    if (httpStatus === 413)
        return 'payload_too_large';
    if (httpStatus === 400 || httpStatus === 422)
        return 'invalid_request';
    if (httpStatus >= 500)
        return 'server_error';
    if (httpStatus >= 400)
        return 'client_error';
    // A sub-400 code recorded on an error row (e.g. a 200 body that carried an
    // error envelope) is a provider anomaly — never treat it as success.
    return 'server_error';
}
/**
 * Derive the `{ error_origin, error_class, superseded }` triple for a message
 * row from the signals available both at ingestion time and in the backfill.
 *
 * Precedence: ok short-circuits → Manifest canned reason → 429 (provider rate
 * limit even when the numeric code was dropped) → synthetic transport codes →
 * any other numeric provider code → an errored row with no captured HTTP
 * response (the fetch failed before the provider replied ⇒ transport/network).
 */
function classifyMessageError(signals) {
    if (signals.status === exports.PENDING_STATUS || signals.status === exports.CANCELLED_STATUS) {
        return { error_origin: null, error_class: null, superseded: false };
    }
    // Accepts both the legacy `ok` and the canonical `success`, so re-classifying
    // an already-normalized row (buildRequestRow reads a collapsed attempt status)
    // still short-circuits as a success rather than falling through to the error
    // branches.
    if (isSuccessStatus(signals.status)) {
        return { error_origin: null, error_class: null, superseded: false };
    }
    // `auto_fixed` (the failed original of a healed request) is a recovered attempt
    // just like `fallback_error`, so it's superseded too — otherwise it would count
    // as a live fault against the provider.
    const superseded = exports.SUPERSEDED_STATUSES.includes(signals.status);
    const manifest = signals.routingReason
        ? MANIFEST_REASON_TO_CLASSIFICATION[signals.routingReason]
        : undefined;
    if (manifest) {
        if (signals.routingReason === 'limit_exceeded' && signals.errorHttpStatus === 402) {
            return {
                error_origin: 'policy',
                error_class: 'plan_request_limit_exceeded',
                superseded,
            };
        }
        return { error_origin: manifest.origin, error_class: manifest.errorClass, superseded };
    }
    if (signals.status === exports.RATE_LIMITED_STATUS) {
        return { error_origin: 'provider', error_class: 'rate_limit', superseded };
    }
    const http = signals.errorHttpStatus ?? null;
    if ((0, provider_error_semantics_1.isAnthropicExtraUsageError)({
        provider: signals.provider,
        httpStatus: http,
        errorBody: signals.errorMessage,
    })) {
        return { error_origin: 'provider', error_class: 'billing', superseded };
    }
    if (http === exports.TRANSPORT_TIMEOUT_HTTP_STATUS) {
        return { error_origin: 'transport', error_class: 'timeout', superseded };
    }
    if (http === exports.TRANSPORT_NETWORK_HTTP_STATUS) {
        return { error_origin: 'transport', error_class: 'network', superseded };
    }
    if (http != null) {
        return { error_origin: 'provider', error_class: classifyHttpErrorClass(http), superseded };
    }
    return { error_origin: 'transport', error_class: 'network', superseded };
}
/**
 * True when an origin is Manifest's own — config, policy, internal, or request —
 * rather than a provider round-trip. Reads MANIFEST_ERROR_ORIGINS, so a new
 * origin added there is covered without touching this guard.
 */
function isManifestErrorOrigin(origin) {
    return origin != null && exports.MANIFEST_ERROR_ORIGINS.includes(origin);
}
//# sourceMappingURL=error-taxonomy.js.map