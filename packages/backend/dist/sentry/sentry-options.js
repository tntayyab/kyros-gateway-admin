"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSentryInitOptions = buildSentryInitOptions;
function buildSentryInitOptions(env) {
    const dsn = env['SENTRY_DSN']?.trim();
    if (!dsn)
        return null;
    return {
        dsn,
        environment: env['SENTRY_ENVIRONMENT']?.trim() || env['NODE_ENV'] || 'development',
        release: env['SENTRY_RELEASE']?.trim() || undefined,
        maxBreadcrumbs: 0,
        dataCollection: {
            userInfo: false,
            cookies: false,
            httpHeaders: { request: false, response: false },
            httpBodies: [],
            queryParams: false,
            genAI: { inputs: false, outputs: false },
            stackFrameVariables: false,
            frameContextLines: 5,
        },
    };
}
//# sourceMappingURL=sentry-options.js.map