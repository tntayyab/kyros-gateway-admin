"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expandProviderNames = void 0;
exports.inferProviderFromModelName = inferProviderFromModelName;
var providers_1 = require("../constants/providers");
Object.defineProperty(exports, "expandProviderNames", { enumerable: true, get: function () { return providers_1.expandProviderNames; } });
function inferProviderFromModelName(modelName) {
    if (!modelName)
        return undefined;
    const slashIdx = modelName.indexOf('/');
    return slashIdx > 0 ? modelName.substring(0, slashIdx).toLowerCase() : undefined;
}
//# sourceMappingURL=provider-aliases.js.map