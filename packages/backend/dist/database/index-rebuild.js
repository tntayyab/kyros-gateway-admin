"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebuildIndexInPlace = rebuildIndexInPlace;
async function shapeOf(queryRunner, name) {
    const rows = (await queryRunner.query(`SELECT i.indisvalid AS "valid", pg_get_indexdef(i.indexrelid) LIKE '% INCLUDE %' AS "covering"
       FROM pg_index i
       JOIN pg_class c ON c.oid = i.indexrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = $1 AND n.nspname = current_schema()`, [name]));
    return rows[0] ?? null;
}
async function rebuildIndexInPlace(queryRunner, spec, target) {
    const covering = target === 'covering';
    const live = await shapeOf(queryRunner, spec.index);
    if (live?.valid && live.covering === covering)
        return;
    const build = await shapeOf(queryRunner, spec.build);
    if (build && (!build.valid || build.covering !== covering)) {
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${spec.build}"`);
    }
    const include = covering ? ` INCLUDE (${spec.include})` : '';
    await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "${spec.build}" ON "${spec.table}" (${spec.key})${include}`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "${spec.index}"`);
    await queryRunner.query(`ALTER INDEX "${spec.build}" RENAME TO "${spec.index}"`);
}
//# sourceMappingURL=index-rebuild.js.map