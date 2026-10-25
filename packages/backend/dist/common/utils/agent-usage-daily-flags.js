"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAgentUsageDailyAutomaticReadsReady = setAgentUsageDailyAutomaticReadsReady;
exports.agentUsageDailyReadsEnabled = agentUsageDailyReadsEnabled;
let automaticReadsReady = false;
function setAgentUsageDailyAutomaticReadsReady(ready) {
    automaticReadsReady = ready;
}
function agentUsageDailyReadsEnabled(tenantId) {
    if (!tenantId)
        return false;
    if (process.env['AGENT_USAGE_DAILY_READS'] === 'false')
        return false;
    if (process.env['AGENT_USAGE_DAILY_READS'] === 'true')
        return true;
    const selected = process.env['AGENT_USAGE_DAILY_READ_TENANTS'];
    if (selected) {
        return selected
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean)
            .includes(tenantId);
    }
    return automaticReadsReady;
}
//# sourceMappingURL=agent-usage-daily-flags.js.map