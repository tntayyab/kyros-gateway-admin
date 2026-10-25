"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSelfHosted = isSelfHosted;
exports.getContainerHostAlias = getContainerHostAlias;
const fs_1 = require("fs");
function isSelfHosted() {
    const explicit = process.env['MANIFEST_MODE'];
    if (explicit === 'cloud')
        return false;
    if (explicit === 'selfhosted' || explicit === 'local')
        return true;
    if (process.env['KUBERNETES_SERVICE_HOST'])
        return true;
    try {
        return (0, fs_1.existsSync)('/.dockerenv') || (0, fs_1.existsSync)('/run/.containerenv');
    }
    catch {
        return false;
    }
}
function getContainerHostAlias() {
    try {
        if ((0, fs_1.existsSync)('/run/.containerenv') && !(0, fs_1.existsSync)('/.dockerenv')) {
            return 'host.containers.internal';
        }
        if ((0, fs_1.existsSync)('/.dockerenv'))
            return 'host.docker.internal';
    }
    catch {
    }
    return 'localhost';
}
//# sourceMappingURL=detect-self-hosted.js.map