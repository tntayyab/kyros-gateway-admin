"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenameBenchmarkToPlayground1789000000000 = void 0;
class RenameBenchmarkToPlayground1789000000000 {
    name = 'RenameBenchmarkToPlayground1789000000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "benchmark_runs" RENAME TO "playground_runs"`);
        await queryRunner.query(`ALTER TABLE "benchmark_columns" RENAME TO "playground_columns"`);
        await queryRunner.query(`ALTER TABLE "playground_columns" RENAME COLUMN "benchmark_run_id" TO "playground_run_id"`);
        await queryRunner.query(`ALTER INDEX "IDX_benchmark_runs_user_agent_created" RENAME TO "IDX_playground_runs_user_agent_created"`);
        await queryRunner.query(`ALTER INDEX "IDX_benchmark_columns_run" RENAME TO "IDX_playground_columns_run"`);
        await queryRunner.query(`ALTER TABLE "playground_runs" RENAME CONSTRAINT "benchmark_runs_pkey" TO "playground_runs_pkey"`);
        await queryRunner.query(`ALTER TABLE "playground_runs" RENAME CONSTRAINT "FK_benchmark_runs_tenant" TO "FK_playground_runs_tenant"`);
        await queryRunner.query(`ALTER TABLE "playground_runs" RENAME CONSTRAINT "FK_benchmark_runs_agent" TO "FK_playground_runs_agent"`);
        await queryRunner.query(`ALTER TABLE "playground_columns" RENAME CONSTRAINT "benchmark_columns_pkey" TO "playground_columns_pkey"`);
        await queryRunner.query(`ALTER TABLE "playground_columns" RENAME CONSTRAINT "FK_benchmark_columns_run" TO "FK_playground_columns_run"`);
        await queryRunner.query(`ALTER TABLE "playground_runs" ADD COLUMN "starred" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "playground_runs" ADD COLUMN "best_column_id" varchar`);
        await queryRunner.query(`ALTER TABLE "playground_runs" ADD CONSTRAINT "FK_playground_runs_best_column" ` +
            `FOREIGN KEY ("best_column_id") REFERENCES "playground_columns"("id") ON DELETE SET NULL`);
        await queryRunner.query(`UPDATE "agent_messages" SET "routing_tier" = 'playground' WHERE "routing_tier" = 'benchmark'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`UPDATE "agent_messages" SET "routing_tier" = 'benchmark' WHERE "routing_tier" = 'playground'`);
        await queryRunner.query(`ALTER TABLE "playground_runs" DROP CONSTRAINT IF EXISTS "FK_playground_runs_best_column"`);
        await queryRunner.query(`ALTER TABLE "playground_runs" DROP COLUMN IF EXISTS "best_column_id"`);
        await queryRunner.query(`ALTER TABLE "playground_runs" DROP COLUMN IF EXISTS "starred"`);
        await queryRunner.query(`ALTER TABLE "playground_columns" RENAME CONSTRAINT "FK_playground_columns_run" TO "FK_benchmark_columns_run"`);
        await queryRunner.query(`ALTER TABLE "playground_columns" RENAME CONSTRAINT "playground_columns_pkey" TO "benchmark_columns_pkey"`);
        await queryRunner.query(`ALTER TABLE "playground_runs" RENAME CONSTRAINT "FK_playground_runs_agent" TO "FK_benchmark_runs_agent"`);
        await queryRunner.query(`ALTER TABLE "playground_runs" RENAME CONSTRAINT "FK_playground_runs_tenant" TO "FK_benchmark_runs_tenant"`);
        await queryRunner.query(`ALTER TABLE "playground_runs" RENAME CONSTRAINT "playground_runs_pkey" TO "benchmark_runs_pkey"`);
        await queryRunner.query(`ALTER INDEX "IDX_playground_columns_run" RENAME TO "IDX_benchmark_columns_run"`);
        await queryRunner.query(`ALTER INDEX "IDX_playground_runs_user_agent_created" RENAME TO "IDX_benchmark_runs_user_agent_created"`);
        await queryRunner.query(`ALTER TABLE "playground_columns" RENAME COLUMN "playground_run_id" TO "benchmark_run_id"`);
        await queryRunner.query(`ALTER TABLE "playground_columns" RENAME TO "benchmark_columns"`);
        await queryRunner.query(`ALTER TABLE "playground_runs" RENAME TO "benchmark_runs"`);
    }
}
exports.RenameBenchmarkToPlayground1789000000000 = RenameBenchmarkToPlayground1789000000000;
//# sourceMappingURL=1789000000000-RenameBenchmarkToPlayground.js.map