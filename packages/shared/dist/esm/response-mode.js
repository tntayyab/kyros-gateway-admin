export const RESPONSE_MODES = ['buffered', 'stream'];
export const DEFAULT_RESPONSE_MODE = 'buffered';
export function isResponseMode(value) {
    return typeof value === 'string' && RESPONSE_MODES.includes(value);
}
//# sourceMappingURL=response-mode.js.map