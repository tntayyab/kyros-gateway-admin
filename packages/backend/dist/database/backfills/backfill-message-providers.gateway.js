"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmBackfillGateway = exports.PASS_3_SQL = exports.PASS_2_SQL = exports.PASS_1_SQL = exports.WINDOW_END_SQL = void 0;
exports.WINDOW_END_SQL = `
  SELECT max(id) AS end_id
  FROM (
    SELECT id FROM "agent_messages" WHERE id > $1 ORDER BY id LIMIT $2
  ) w
`;
function stampingPass(joinAndMatch) {
    return `
    WITH upd AS (
      UPDATE "agent_messages" am
      SET "tenant_provider_id" = m.tp_id
      FROM (
        SELECT am2.id AS msg_id, MIN(tp.id) AS tp_id
        ${joinAndMatch}
        GROUP BY am2.id
        HAVING COUNT(*) = 1
      ) m
      WHERE am.id = m.msg_id
      RETURNING 1
    )
    SELECT count(*)::int AS n FROM upd
  `;
}
exports.PASS_1_SQL = stampingPass(`
  FROM "agent_messages" am2
  JOIN "tenant_providers" tp
    ON tp.agent_id = am2.agent_id
   AND LOWER(tp.provider) = LOWER(am2.provider)
   AND tp.auth_type = am2.auth_type
   AND LOWER(tp.label) = LOWER(COALESCE(am2.provider_key_label, 'Default'))
  WHERE am2.tenant_provider_id IS NULL
    AND am2.provider IS NOT NULL
    AND am2.agent_id IS NOT NULL
    AND am2.id > $1 AND am2.id <= $2
`);
exports.PASS_2_SQL = stampingPass(`
  FROM "agent_messages" am2
  JOIN "tenant_providers" tp
    ON tp.agent_id = am2.agent_id
   AND LOWER(tp.provider) = LOWER(am2.provider)
   AND tp.auth_type = am2.auth_type
  WHERE am2.tenant_provider_id IS NULL
    AND am2.provider IS NOT NULL
    AND am2.agent_id IS NOT NULL
    AND am2.id > $1 AND am2.id <= $2
`);
exports.PASS_3_SQL = stampingPass(`
  FROM "agent_messages" am2
  JOIN "tenants" t ON t.id = am2.tenant_id
  JOIN "tenant_providers" tp
    ON tp.created_by_user_id = t.name
   AND LOWER(tp.provider) = LOWER(am2.provider)
   AND tp.auth_type = am2.auth_type
   AND LOWER(tp.label) = LOWER(COALESCE(am2.provider_key_label, 'Default'))
  WHERE am2.tenant_provider_id IS NULL
    AND am2.provider IS NOT NULL
    AND am2.id > $1 AND am2.id <= $2
`);
class TypeOrmBackfillGateway {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async analyze() {
        await this.dataSource.query('ANALYZE "agent_messages"');
        await this.dataSource.query('ANALYZE "tenant_providers"');
    }
    async nextWindowEnd(afterId, batchSize) {
        const rows = (await this.dataSource.query(exports.WINDOW_END_SQL, [afterId, batchSize]));
        return rows[0]?.end_id ?? null;
    }
    async stampWindow(afterId, endId, timeouts) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.query(`SET LOCAL lock_timeout = '${timeouts.lockTimeoutMs}ms'`);
            await queryRunner.query(`SET LOCAL statement_timeout = '${timeouts.statementTimeoutMs}ms'`);
            const params = [afterId, endId];
            const [{ n: n1 }] = (await queryRunner.query(exports.PASS_1_SQL, params));
            const [{ n: n2 }] = (await queryRunner.query(exports.PASS_2_SQL, params));
            const [{ n: n3 }] = (await queryRunner.query(exports.PASS_3_SQL, params));
            await queryRunner.commitTransaction();
            return n1 + n2 + n3;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
}
exports.TypeOrmBackfillGateway = TypeOrmBackfillGateway;
//# sourceMappingURL=backfill-message-providers.gateway.js.map