"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalizeTileProviderMessages1777200000000 = void 0;
class CanonicalizeTileProviderMessages1777200000000 {
    name = 'CanonicalizeTileProviderMessages1777200000000';
    async up(queryRunner) {
        await queryRunner.query(`UPDATE "agent_messages" am
         SET
           "provider" = sub.canonical_id,
           "model" = CASE
             WHEN am.model LIKE 'custom:' || cp.id || '/%'
               THEN sub.canonical_id || '/' || SUBSTRING(am.model FROM LENGTH('custom:' || cp.id || '/') + 1)
             ELSE am.model
           END
         FROM "custom_providers" cp
         CROSS JOIN LATERAL (
           SELECT CASE lower(regexp_replace(cp.name, '[\\s._-]+', '', 'g'))
             WHEN 'llamacpp' THEN 'llamacpp'
             WHEN 'lmstudio' THEN 'lmstudio'
             ELSE NULL
           END AS canonical_id
         ) sub
         WHERE am."provider" = 'custom:' || cp.id
           AND sub.canonical_id IS NOT NULL`);
        await queryRunner.query(`UPDATE "agent_messages" am
         SET "fallback_from_model" =
           sub.canonical_id || '/' || SUBSTRING(am.fallback_from_model FROM LENGTH('custom:' || cp.id || '/') + 1)
         FROM "custom_providers" cp
         CROSS JOIN LATERAL (
           SELECT CASE lower(regexp_replace(cp.name, '[\\s._-]+', '', 'g'))
             WHEN 'llamacpp' THEN 'llamacpp'
             WHEN 'lmstudio' THEN 'lmstudio'
             ELSE NULL
           END AS canonical_id
         ) sub
         WHERE am."fallback_from_model" LIKE 'custom:' || cp.id || '/%'
           AND sub.canonical_id IS NOT NULL`);
    }
    async down() {
    }
}
exports.CanonicalizeTileProviderMessages1777200000000 = CanonicalizeTileProviderMessages1777200000000;
//# sourceMappingURL=1777200000000-CanonicalizeTileProviderMessages.js.map