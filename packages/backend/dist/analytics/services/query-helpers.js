"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MESSAGE_ROW_SELECT_ALIASES = exports.PROVIDER_SERIES_KEY_EXPR = exports.CUSTOM_PROVIDER_JOIN_CONDITION = exports.EXCLUDE_DIRECT_ATTEMPTS_PREDICATE = exports.EXCLUDE_PLAYGROUND_AGENTS_PREDICATE = exports.MANIFEST_ORIGIN_PREDICATE = exports.SUCCESS_STATUS_SQL_LIST = exports.SUCCESS_MESSAGE_STATUSES = exports.ERROR_MESSAGE_STATUSES = void 0;
exports.formatTimestamp = formatTimestamp;
exports.computeTrend = computeTrend;
exports.sqlIsSuccessStatus = sqlIsSuccessStatus;
exports.sqlIsFailedStatus = sqlIsFailedStatus;
exports.sqlIsCompletedStatus = sqlIsCompletedStatus;
exports.sqlCountMessages = sqlCountMessages;
exports.downsample = downsample;
exports.addTenantFilter = addTenantFilter;
exports.sqlAgentScope = sqlAgentScope;
exports.sqlExcludePlayground = sqlExcludePlayground;
exports.excludePlaygroundAgents = excludePlaygroundAgents;
exports.excludeDirectAttempts = excludeDirectAttempts;
exports.sqlExcludeDirectRequests = sqlExcludeDirectRequests;
exports.filterByKeyLabel = filterByKeyLabel;
exports.filterByTenantProviderId = filterByTenantProviderId;
exports.scopeToConnection = scopeToConnection;
exports.selectMessageRowColumns = selectMessageRowColumns;
const manifest_shared_1 = require("manifest-shared");
const custom_provider_entity_1 = require("../../entities/custom-provider.entity");
function formatTimestamp(d) {
    const p = (n, len = 2) => String(n).padStart(len, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
}
function computeTrend(current, previous) {
    const EPS = 1e-6;
    if (Math.abs(previous) < EPS)
        return 0;
    const pct = Math.round(((current - previous) / previous) * 100);
    return Math.max(-999, Math.min(999, pct));
}
exports.ERROR_MESSAGE_STATUSES = [
    'error',
    'fallback_error',
    'rate_limited',
    'auto_fixed',
    'failed',
];
exports.SUCCESS_MESSAGE_STATUSES = ['ok', 'success'];
exports.SUCCESS_STATUS_SQL_LIST = exports.SUCCESS_MESSAGE_STATUSES.map((s) => `'${s}'`).join(', ');
function sqlIsSuccessStatus(column) {
    return `(${column} IS NULL OR ${column} IN (${exports.SUCCESS_STATUS_SQL_LIST}))`;
}
function sqlIsFailedStatus(column) {
    return `(${column} IS NOT NULL AND ${column} NOT IN ('pending', 'cancelled', ${exports.SUCCESS_STATUS_SQL_LIST}))`;
}
function sqlIsCompletedStatus(column) {
    return `(${column} IS NULL OR ${column} NOT IN ('pending', 'cancelled'))`;
}
function sqlCountMessages(alias = 'at') {
    const list = exports.ERROR_MESSAGE_STATUSES.map((s) => `'${s}'`).join(', ');
    return `COUNT(DISTINCT COALESCE(${alias}.request_id, ${alias}.id)) FILTER (WHERE ${alias}.status IS NULL OR (${alias}.status NOT IN ('pending', 'cancelled') AND ${alias}.status NOT IN (${list})))`;
}
const MANIFEST_ORIGIN_SQL_LIST = manifest_shared_1.MANIFEST_ERROR_ORIGINS.map((o) => `'${o}'`).join(', ');
exports.MANIFEST_ORIGIN_PREDICATE = `at.error_origin IN (${MANIFEST_ORIGIN_SQL_LIST})`;
function downsample(data, targetLen) {
    if (data.length <= targetLen)
        return data;
    const result = [];
    const bucketSize = data.length / targetLen;
    for (let i = 0; i < targetLen; i++) {
        const start = Math.floor(i * bucketSize);
        const end = Math.floor((i + 1) * bucketSize);
        let sum = 0;
        for (let j = start; j < end; j++)
            sum += data[j] ?? 0;
        result.push(sum);
    }
    return result;
}
function addTenantFilter(qb, tenantId, agentScope, alias = 'at') {
    if (!tenantId || (agentScope && (agentScope.tenantId !== tenantId || !agentScope.agentId))) {
        return qb.andWhere('1 = 0', { tenantId });
    }
    qb.andWhere(`${alias}.tenant_id = :tenantId`, { tenantId });
    if (agentScope) {
        qb.andWhere(`${alias}.agent_id = :liveAgentId`, { liveAgentId: agentScope.agentId });
    }
    return qb;
}
function sqlAgentScope(alias, parameter, agentScope) {
    if (!agentScope)
        return '';
    return `AND ${alias}.agent_id = ${parameter}`;
}
function sqlExcludePlayground(alias) {
    return `NOT (
    COALESCE(${alias}.agent_id IN (SELECT plg.id FROM agents plg WHERE plg.is_playground = true), false)
    OR COALESCE((${alias}.tenant_id, ${alias}.agent_name) IN (SELECT plg.tenant_id, plg.name FROM agents plg WHERE plg.is_playground = true), false)
  )`;
}
exports.EXCLUDE_PLAYGROUND_AGENTS_PREDICATE = sqlExcludePlayground('at');
function excludePlaygroundAgents(qb) {
    return qb.andWhere(exports.EXCLUDE_PLAYGROUND_AGENTS_PREDICATE);
}
exports.EXCLUDE_DIRECT_ATTEMPTS_PREDICATE = "at.routing_reason IS DISTINCT FROM 'direct'";
function excludeDirectAttempts(qb) {
    return qb.andWhere(exports.EXCLUDE_DIRECT_ATTEMPTS_PREDICATE);
}
function sqlExcludeDirectRequests(alias) {
    return `NOT EXISTS (SELECT 1 FROM agent_messages direct_attempt WHERE direct_attempt.request_id = ${alias}.id AND direct_attempt.routing_reason = 'direct')`;
}
function filterByKeyLabel(qb, label) {
    return qb.andWhere("LOWER(COALESCE(at.provider_key_label, 'Default')) = LOWER(:keyLabel)", {
        keyLabel: label && label.length > 0 ? label : 'Default',
    });
}
function filterByTenantProviderId(qb, tenantProviderId) {
    return qb.andWhere('at.tenant_provider_id = :tenantProviderId', { tenantProviderId });
}
function scopeToConnection(qb, tenantProviderId, label) {
    if (tenantProviderId)
        return filterByTenantProviderId(qb, tenantProviderId);
    if (label !== undefined)
        return filterByKeyLabel(qb, label);
    return qb;
}
exports.CUSTOM_PROVIDER_JOIN_CONDITION = "at.provider = 'custom:' || cp.id";
exports.PROVIDER_SERIES_KEY_EXPR = "CASE WHEN at.provider LIKE 'custom:%' THEN COALESCE(cp.name, 'Deleted provider') ELSE at.provider END";
exports.MESSAGE_ROW_SELECT_ALIASES = [
    'id',
    'timestamp',
    'agent_name',
    'model',
    'provider',
    'display_name',
    'input_tokens',
    'output_tokens',
    'status',
    'total_tokens',
    'cost',
    'routing_tier',
    'routing_reason',
    'specificity_category',
    'error_message',
    'error_code',
    'error_origin',
    'error_class',
    'error_http_status',
    'auth_type',
    'fallback_from_model',
    'fallback_index',
    'feedback_rating',
    'header_tier_id',
    'header_tier_name',
    'header_tier_color',
    'provider_key_label',
    'custom_provider_name',
    'autofix_applied',
    'autofix_role',
];
function selectMessageRowColumns(qb, costExpr) {
    return qb
        .leftJoin(custom_provider_entity_1.CustomProvider, 'cp', exports.CUSTOM_PROVIDER_JOIN_CONDITION)
        .select('at.id', 'id')
        .addSelect('at.timestamp', 'timestamp')
        .addSelect('at.agent_name', 'agent_name')
        .addSelect('at.model', 'model')
        .addSelect('at.provider', 'provider')
        .addSelect('at.model', 'display_name')
        .addSelect('at.input_tokens', 'input_tokens')
        .addSelect('at.output_tokens', 'output_tokens')
        .addSelect('at.status', 'status')
        .addSelect('at.input_tokens + at.output_tokens', 'total_tokens')
        .addSelect(costExpr, 'cost')
        .addSelect('at.routing_tier', 'routing_tier')
        .addSelect('at.routing_reason', 'routing_reason')
        .addSelect('at.specificity_category', 'specificity_category')
        .addSelect('at.error_message', 'error_message')
        .addSelect('at.error_code', 'error_code')
        .addSelect('at.error_origin', 'error_origin')
        .addSelect('at.error_class', 'error_class')
        .addSelect('at.error_http_status', 'error_http_status')
        .addSelect('at.auth_type', 'auth_type')
        .addSelect('at.fallback_from_model', 'fallback_from_model')
        .addSelect('at.fallback_index', 'fallback_index')
        .addSelect('at.feedback_rating', 'feedback_rating')
        .addSelect('at.header_tier_id', 'header_tier_id')
        .addSelect('at.header_tier_name', 'header_tier_name')
        .addSelect('at.header_tier_color', 'header_tier_color')
        .addSelect('at.provider_key_label', 'provider_key_label')
        .addSelect('cp.name', 'custom_provider_name')
        .addSelect('at.autofix_applied', 'autofix_applied')
        .addSelect('at.autofix_role', 'autofix_role');
}
//# sourceMappingURL=query-helpers.js.map