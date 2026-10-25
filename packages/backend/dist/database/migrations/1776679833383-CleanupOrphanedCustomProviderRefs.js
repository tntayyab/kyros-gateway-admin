"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupOrphanedCustomProviderRefs1776679833383 = void 0;
const CUSTOM_PROVIDER_PREFIX = 'custom:';
class CleanupOrphanedCustomProviderRefs1776679833383 {
    name = 'CleanupOrphanedCustomProviderRefs1776679833383';
    async up(queryRunner) {
        const existing = await queryRunner.query('SELECT id FROM custom_providers');
        const existingIds = new Set(existing.map((row) => row.id));
        await this.cleanTable(queryRunner, 'tier_assignments', existingIds);
        await this.cleanTable(queryRunner, 'specificity_assignments', existingIds);
    }
    async down() {
    }
    async cleanTable(queryRunner, table, existingIds) {
        const rows = await queryRunner.query(`SELECT id, override_model, override_provider, fallback_models
         FROM "${table}"
        WHERE override_provider LIKE $1
           OR override_model LIKE $1
           OR fallback_models LIKE $2`, [`${CUSTOM_PROVIDER_PREFIX}%`, `%${CUSTOM_PROVIDER_PREFIX}%`]);
        for (const row of rows) {
            let overrideModel = row.override_model;
            let overrideProvider = row.override_provider;
            let fallbackModels = row.fallback_models;
            let clearOverrideAuth = false;
            let changed = false;
            const overrideCustomId = extractCustomIdFromProvider(overrideProvider) ?? extractCustomIdFromModel(overrideModel);
            if (overrideCustomId && !existingIds.has(overrideCustomId)) {
                overrideModel = null;
                overrideProvider = null;
                clearOverrideAuth = true;
                changed = true;
            }
            if (fallbackModels) {
                try {
                    const parsed = JSON.parse(fallbackModels);
                    if (Array.isArray(parsed)) {
                        const filtered = parsed.filter((entry) => {
                            if (typeof entry !== 'string')
                                return true;
                            const id = extractCustomIdFromModel(entry);
                            return !id || existingIds.has(id);
                        });
                        if (filtered.length !== parsed.length) {
                            fallbackModels = filtered.length > 0 ? JSON.stringify(filtered) : null;
                            changed = true;
                        }
                    }
                }
                catch {
                }
            }
            if (!changed)
                continue;
            if (clearOverrideAuth) {
                await queryRunner.query(`UPDATE "${table}"
              SET override_model = $1,
                  override_provider = $2,
                  override_auth_type = NULL,
                  fallback_models = $3,
                  updated_at = NOW()
            WHERE id = $4`, [overrideModel, overrideProvider, fallbackModels, row.id]);
            }
            else {
                await queryRunner.query(`UPDATE "${table}"
              SET fallback_models = $1,
                  updated_at = NOW()
            WHERE id = $2`, [fallbackModels, row.id]);
            }
        }
    }
}
exports.CleanupOrphanedCustomProviderRefs1776679833383 = CleanupOrphanedCustomProviderRefs1776679833383;
function extractCustomIdFromProvider(value) {
    if (!value)
        return null;
    if (!value.startsWith(CUSTOM_PROVIDER_PREFIX))
        return null;
    const id = value.slice(CUSTOM_PROVIDER_PREFIX.length);
    return id.length > 0 ? id : null;
}
function extractCustomIdFromModel(value) {
    if (!value)
        return null;
    if (!value.startsWith(CUSTOM_PROVIDER_PREFIX))
        return null;
    const rest = value.slice(CUSTOM_PROVIDER_PREFIX.length);
    const slash = rest.indexOf('/');
    const id = slash === -1 ? rest : rest.slice(0, slash);
    return id.length > 0 ? id : null;
}
//# sourceMappingURL=1776679833383-CleanupOrphanedCustomProviderRefs.js.map