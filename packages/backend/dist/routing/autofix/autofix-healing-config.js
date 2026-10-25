"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTOFIX_URL = void 0;
exports.resolveHealingUrl = resolveHealingUrl;
exports.AUTOFIX_URL = 'https://autofix.manifest.build';
function resolveHealingUrl(nodeEnv) {
    return nodeEnv === 'production' ? exports.AUTOFIX_URL : undefined;
}
//# sourceMappingURL=autofix-healing-config.js.map