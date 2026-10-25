"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRequestTools = registerRequestTools;
const zod_1 = require("zod");
const messages_query_dto_1 = require("../../analytics/dto/messages-query.dto");
const range_util_1 = require("../../common/utils/range.util");
const tool_result_1 = require("../tool-result");
function registerRequestTools(server, deps, operator) {
    server.registerTool('manifest_requests_get', {
        title: 'Get requests',
        description: 'List recent Manifest requests (provider attempts) with cursor pagination.',
        inputSchema: zod_1.z.object({
            agent: zod_1.z.string().min(1).max(100).optional(),
            range: zod_1.z.enum(range_util_1.RANGE_VALUES).optional(),
            status: zod_1.z.enum(messages_query_dto_1.MESSAGE_STATUS_FILTER_VALUES).optional(),
            provider: zod_1.z.string().min(1).max(100).optional(),
            origin: zod_1.z.enum(messages_query_dto_1.MESSAGE_ORIGIN_FILTER_VALUES).optional(),
            limit: zod_1.z.number().int().min(1).max(200).optional(),
            cursor: zod_1.z.string().min(1).max(500).optional(),
        }),
        annotations: { readOnlyHint: true },
    }, async ({ agent, range, status, provider, origin, limit, cursor }) => (0, tool_result_1.result)((async () => {
        const page = (await deps.messages.getMessages({
            tenantId: operator.tenantId,
            agent_name: agent,
            range,
            status,
            provider,
            origin,
            limit: Math.min(limit ?? 50, 200),
            cursor,
            include_filter_options: false,
        }));
        return {
            items: page.items ?? [],
            next_cursor: page.next_cursor ?? null,
            total_count: page.total_count ?? 0,
        };
    })()));
}
//# sourceMappingURL=requests.tools.js.map