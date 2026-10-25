"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANTHROPIC_OAUTH = void 0;
exports.ANTHROPIC_OAUTH = {
    CLIENT_ID: '9d1c250a-e61b-44d9-88ed-5944d1962f5e',
    AUTHORIZE_URL: 'https://claude.ai/oauth/authorize',
    TOKEN_URL: 'https://api.anthropic.com/v1/oauth/token',
    REDIRECT_URI: 'https://console.anthropic.com/oauth/code/callback',
    SCOPE: 'org:create_api_key user:profile user:inference',
    STATE_TTL_MS: 10 * 60 * 1000,
};
//# sourceMappingURL=anthropic-oauth.config.js.map