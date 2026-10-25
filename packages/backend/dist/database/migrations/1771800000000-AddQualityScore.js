"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddQualityScore1771800000000 = void 0;
class AddQualityScore1771800000000 {
    async up(queryRunner) {
        const rows = await queryRunner.query(`SELECT 1 FROM information_schema.columns WHERE table_name = 'model_pricing' AND column_name = 'quality_score'`);
        if (rows.length === 0) {
            await queryRunner.query(`ALTER TABLE model_pricing ADD COLUMN quality_score INTEGER NOT NULL DEFAULT 3`);
        }
        const scores = [
            ['claude-opus-4-6', 5],
            ['claude-sonnet-4-5-20250929', 4],
            ['claude-sonnet-4-20250514', 4],
            ['claude-haiku-4-5-20251001', 2],
            ['gpt-4.1', 5],
            ['gpt-4o', 3],
            ['gpt-4o-mini', 2],
            ['gpt-4.1-mini', 2],
            ['gpt-4.1-nano', 1],
            ['o3', 5],
            ['o3-mini', 3],
            ['o4-mini', 3],
            ['gemini-2.5-pro', 5],
            ['gemini-2.5-flash', 2],
            ['gemini-2.5-flash-lite', 1],
            ['gemini-2.0-flash', 2],
            ['deepseek-chat', 2],
            ['deepseek-reasoner', 4],
            ['kimi-k2', 3],
            ['qwen-2.5-72b-instruct', 2],
            ['qwq-32b', 1],
            ['qwen-2.5-coder-32b-instruct', 2],
            ['mistral-large', 3],
            ['mistral-small', 1],
            ['codestral', 2],
            ['llama-4-maverick', 3],
            ['llama-4-scout', 2],
            ['command-r-plus', 3],
            ['command-r', 2],
        ];
        for (const [model, score] of scores) {
            await queryRunner.query(`UPDATE model_pricing SET quality_score = $1 WHERE model_name = $2`, [score, model]);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE model_pricing DROP COLUMN IF EXISTS quality_score`);
    }
}
exports.AddQualityScore1771800000000 = AddQualityScore1771800000000;
//# sourceMappingURL=1771800000000-AddQualityScore.js.map