"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveFrontendDir = resolveFrontendDir;
const path_1 = require("path");
const fs_1 = require("fs");
function hasIndex(dir) {
    return (0, fs_1.existsSync)((0, path_1.join)(dir, 'index.html'));
}
function resolveFrontendDir() {
    const envDir = process.env['MANIFEST_FRONTEND_DIR'];
    if (envDir && hasIndex(envDir))
        return envDir;
    const monorepo = (0, path_1.join)(__dirname, '..', '..', '..', '..', 'frontend', 'dist');
    if (hasIndex(monorepo))
        return monorepo;
    const embedded = (0, path_1.join)(__dirname, '..', '..', '..', '..', 'public');
    if (hasIndex(embedded))
        return embedded;
    return null;
}
//# sourceMappingURL=frontend-path.js.map