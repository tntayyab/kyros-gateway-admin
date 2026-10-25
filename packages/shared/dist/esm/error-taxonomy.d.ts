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
export declare const TRANSPORT_NETWORK_HTTP_STATUS = 503;
export declare const TRANSPORT_TIMEOUT_HTTP_STATUS = 504;
/** Non-ok terminal/attempt statuses the proxy writes to `agent_messages.status`. */
export declare const OK_STATUS = "ok";
export declare const RATE_LIMITED_STATUS = "rate_limited";
/** A row that failed but was recovered by a later attempt (retry / fallback). */
export declare const SUPERSEDED_STATUS = "fallback_error";
/** The failed original of a healed Autofix flow — recovered by the retry row. */
export declare const AUTOFIX_ORIGINAL_STATUS = "auto_fixed";
/** Every status whose row is a recovered (superseded) attempt, not a terminal failure. */
export declare const SUPERSEDED_STATUSES: readonly string[];
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
export declare const PENDING_STATUS = "pending";
export declare const CANCELLED_STATUS = "cancelled";
export declare const SUCCESS_STATUS = "success";
export declare const FAILED_STATUS = "failed";
export declare const REQUEST_STATUSES: readonly ["pending", "cancelled", "success", "failed"];
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export declare const ATTEMPT_STATUSES: readonly ["pending", "cancelled", "success", "failed"];
export type AttemptStatus = (typeof ATTEMPT_STATUSES)[number];
/**
 * Collapse any status value — legacy (`ok`/`error`/`rate_limited`/
 * `fallback_error`/`auto_fixed`) or canonical — onto the canonical vocabulary.
 * A nullish value is treated as `success`, matching the legacy writer convention
 * where an absent status meant `ok`. Unknown non-null values fail closed.
 */
export declare function normalizeStatus(status: string | null | undefined): RequestStatus;
/** True for a terminal success, whether stored as legacy `ok` or canonical `success`. */
export declare function isSuccessStatus(status: string | null | undefined): boolean;
/** True for a terminal failure, whether stored as a legacy error value or canonical `failed`. */
export declare function isFailedStatus(status: string | null | undefined): boolean;
export declare const ERROR_ORIGINS: readonly ["provider", "transport", "config", "policy", "internal", "request"];
export type ErrorOrigin = (typeof ERROR_ORIGINS)[number];
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
export declare const MANIFEST_ERROR_ORIGINS: readonly ["config", "policy", "internal", "request"];
export type ManifestErrorOrigin = (typeof MANIFEST_ERROR_ORIGINS)[number];
export declare const ERROR_CLASSES: readonly ["rate_limit", "auth", "invalid_request", "not_found", "payload_too_large", "billing", "server_error", "client_error", "timeout", "network", "no_provider", "no_provider_key", "subscription_credentials_unusable", "local_provider_unavailable", "limit_exceeded", "plan_request_limit_exceeded", "internal"];
export type ErrorClass = (typeof ERROR_CLASSES)[number];
/** Map a provider's HTTP status code to a normalized error class. */
export declare function classifyHttpErrorClass(httpStatus: number): ErrorClass;
export interface MessageErrorSignals {
    /** `agent_messages.status`. */
    status: string;
    /** `agent_messages.error_http_status` (numeric provider/synthetic code, or null). */
    errorHttpStatus?: number | null;
    /** `agent_messages.routing_reason` — carries the canned Manifest reason for stubs. */
    routingReason?: string | null;
    /** Canonical provider id, used for narrow provider-specific semantic overrides. */
    provider?: string | null;
    /** Raw or persisted provider error envelope. */
    errorMessage?: string | null;
}
export interface MessageErrorClassification {
    error_origin: ErrorOrigin | null;
    error_class: ErrorClass | null;
    superseded: boolean;
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
export declare function classifyMessageError(signals: MessageErrorSignals): MessageErrorClassification;
/**
 * True when an origin is Manifest's own — config, policy, internal, or request —
 * rather than a provider round-trip. Reads MANIFEST_ERROR_ORIGINS, so a new
 * origin added there is covered without touching this guard.
 */
export declare function isManifestErrorOrigin(origin: string | null | undefined): origin is ManifestErrorOrigin;
//# sourceMappingURL=error-taxonomy.d.ts.map