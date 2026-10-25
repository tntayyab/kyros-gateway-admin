"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishedOpencodeGoIds = publishedOpencodeGoIds;
exports.dropShadowedGatewayModels = dropShadowedGatewayModels;
const OPENCODE_GO = 'opencode-go';
const OPENCODE_GO_PREFIX = `${OPENCODE_GO}/`;
function isOpencodeGo(row) {
    return row.provider.toLowerCase() === OPENCODE_GO;
}
function bareId(modelName) {
    return modelName.startsWith(OPENCODE_GO_PREFIX)
        ? modelName.slice(OPENCODE_GO_PREFIX.length)
        : modelName;
}
function label(row) {
    return row.display_name || row.model_name;
}
async function publishedOpencodeGoIds(models, docs, modelsDev) {
    const published = new Set();
    if (!models.some(isOpencodeGo))
        return published;
    for (const entry of (await docs?.list()) ?? [])
        published.add(entry.id);
    for (const entry of modelsDev?.getModelsForProvider(OPENCODE_GO) ?? [])
        published.add(entry.id);
    return published;
}
function dropShadowedGatewayModels(rows, published) {
    if (published.size === 0)
        return rows;
    const publishedLabels = new Set();
    for (const row of rows) {
        if (isOpencodeGo(row) && published.has(bareId(row.model_name))) {
            publishedLabels.add(label(row));
        }
    }
    if (publishedLabels.size === 0)
        return rows;
    return rows.filter((row) => {
        if (!isOpencodeGo(row))
            return true;
        if (published.has(bareId(row.model_name)))
            return true;
        return !publishedLabels.has(label(row));
    });
}
//# sourceMappingURL=published-gateway-models.js.map