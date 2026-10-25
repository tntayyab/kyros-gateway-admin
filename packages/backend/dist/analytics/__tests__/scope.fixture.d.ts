import { AnalyticsScopeService, AgentScope } from '../services/analytics-scope.service';
export declare function selectedAgent(tenantId: string | null, agentName: string): AgentScope;
export declare function mockScopeResolver(query?: jest.Mock): AnalyticsScopeService;
