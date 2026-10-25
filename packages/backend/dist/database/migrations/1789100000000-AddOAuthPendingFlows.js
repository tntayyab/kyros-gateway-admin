"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddOAuthPendingFlows1789100000000 = void 0;
class AddOAuthPendingFlows1789100000000 {
    name = 'AddOAuthPendingFlows1789100000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "oauth_pending_flows" (
        "provider" varchar NOT NULL,
        "state" varchar NOT NULL,
        "code_verifier" text NOT NULL,
        "agent_id" varchar NOT NULL,
        "user_id" varchar NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_oauth_pending_flows" PRIMARY KEY ("provider", "state"),
        CONSTRAINT "FK_oauth_pending_flows_agent"
          FOREIGN KEY ("agent_id")
          REFERENCES "agents"("id")
          ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_oauth_pending_flows_agent_user" ` +
            `ON "oauth_pending_flows" ("provider", "agent_id", "user_id", "created_at" DESC)`);
        await queryRunner.query(`CREATE INDEX "IDX_oauth_pending_flows_expires" ON "oauth_pending_flows" ("expires_at")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_oauth_pending_flows_expires"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_oauth_pending_flows_agent_user"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "oauth_pending_flows"`);
    }
}
exports.AddOAuthPendingFlows1789100000000 = AddOAuthPendingFlows1789100000000;
//# sourceMappingURL=1789100000000-AddOAuthPendingFlows.js.map