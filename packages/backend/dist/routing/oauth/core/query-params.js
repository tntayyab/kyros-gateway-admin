"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalTrimmedStringQuery = optionalTrimmedStringQuery;
const common_1 = require("@nestjs/common");
function optionalTrimmedStringQuery(value, name) {
    if (value === undefined)
        return undefined;
    if (typeof value !== 'string') {
        throw new common_1.HttpException(`${name} query parameter must be a string`, common_1.HttpStatus.BAD_REQUEST);
    }
    return value.trim() || undefined;
}
//# sourceMappingURL=query-params.js.map