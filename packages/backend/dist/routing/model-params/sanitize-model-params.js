"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeModelParams = sanitizeModelParams;
const common_1 = require("@nestjs/common");
const manifest_shared_1 = require("manifest-shared");
function sanitizeModelParams(provider, params, specs) {
    const keys = Object.keys(params).filter((k) => params[k] !== undefined);
    if (keys.length === 0) {
        throw new common_1.BadRequestException('params must contain at least one configurable field');
    }
    const out = (0, manifest_shared_1.pickProviderCompatibleParams)(params, specs);
    if (Object.keys(out).length === 0) {
        throw new common_1.BadRequestException(`Provider "${provider}" does not consume any of the supplied params`);
    }
    for (const spec of specs) {
        const value = (0, manifest_shared_1.getProviderParamValue)(out, spec.path);
        if (value !== undefined && !(0, manifest_shared_1.providerParamValueIsValid)(spec, value)) {
            throw new common_1.BadRequestException(`Invalid value for param "${spec.path}"`);
        }
    }
    return out;
}
//# sourceMappingURL=sanitize-model-params.js.map