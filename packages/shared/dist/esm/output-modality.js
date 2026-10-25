export const OUTPUT_MODALITIES = ['text'];
export const DEFAULT_OUTPUT_MODALITY = 'text';
export function isOutputModality(value) {
    return typeof value === 'string' && OUTPUT_MODALITIES.includes(value);
}
//# sourceMappingURL=output-modality.js.map