"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRequestBackfillDatabaseUrl = resolveRequestBackfillDatabaseUrl;
exports.createRequestBackfillDataSource = createRequestBackfillDataSource;
const typeorm_1 = require("typeorm");
const backfill_state_entity_1 = require("../../entities/backfill-state.entity");
function resolveRequestBackfillDatabaseUrl(env) {
    const directUrl = env['MIGRATION_DATABASE_URL']?.trim() ||
        env['DATABASE_UNPOOLED_URL']?.trim() ||
        env['BACKFILL_DATABASE_URL']?.trim();
    if (directUrl)
        return directUrl;
    throw new Error('A direct PostgreSQL URL is required; set MIGRATION_DATABASE_URL, DATABASE_UNPOOLED_URL, or BACKFILL_DATABASE_URL');
}
function createRequestBackfillDataSource(env) {
    return new typeorm_1.DataSource({
        type: 'postgres',
        url: resolveRequestBackfillDatabaseUrl(env),
        entities: [backfill_state_entity_1.BackfillState],
        extra: { max: 2 },
    });
}
//# sourceMappingURL=request-backfill.datasource.js.map