"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_OUTPUT_MODALITY = exports.OUTPUT_MODALITIES = void 0;
exports.isOutputModality = isOutputModality;
exports.OUTPUT_MODALITIES = ['text'];
exports.DEFAULT_OUTPUT_MODALITY = 'text';
function isOutputModality(value) {
    return typeof value === 'string' && exports.OUTPUT_MODALITIES.includes(value);
}
//# sourceMappingURL=output-modality.js.map