"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectedAgent = selectedAgent;
exports.mockScopeResolver = mockScopeResolver;
const analytics_scope_service_1 = require("../services/analytics-scope.service");
function selectedAgent(tenantId, agentName) {
    return { tenantId, agentName, agentId: agentName };
}
function mockScopeResolver(query) {
    return new analytics_scope_service_1.AnalyticsScopeService({
        query: query ?? jest.fn(async (_sql, [_tenantId, name]) => [{ id: name }]),
    });
}
//# sourceMappingURL=scope.fixture.js.map