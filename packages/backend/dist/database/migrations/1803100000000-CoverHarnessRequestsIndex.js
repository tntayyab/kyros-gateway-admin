"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoverHarnessRequestsIndex1803100000000 = void 0;
const index_rebuild_1 = require("../index-rebuild");
class CoverHarnessRequestsIndex1803100000000 {
    name = 'CoverHarnessRequestsIndex1803100000000';
    transaction = false;
    static INDEX = {
        table: 'requests',
        index: 'IDX_requests_tenant_agent_timestamp',
        build: 'IDX_requests_tenant_agent_timestamp_next',
        key: '"tenant_id", "agent_id", "timestamp"',
        include: '"id", "status", "error_origin", "error_class", "requested_model"',
    };
    async up(queryRunner) {
        await (0, index_rebuild_1.rebuildIndexInPlace)(queryRunner, CoverHarnessRequestsIndex1803100000000.INDEX, 'covering');
    }
    async down(queryRunner) {
        await (0, index_rebuild_1.rebuildIndexInPlace)(queryRunner, CoverHarnessRequestsIndex1803100000000.INDEX, 'plain');
    }
}
exports.CoverHarnessRequestsIndex1803100000000 = CoverHarnessRequestsIndex1803100000000;
//# sourceMappingURL=1803100000000-CoverHarnessRequestsIndex.js.map