"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COPILOT_PLUGIN_VERSION = exports.COPILOT_EDITOR_VERSION = exports.buildClaudeCodeSubscriptionHeaders = exports.CLAUDE_CODE_BETA_FLAGS = exports.CLAUDE_CODE_STAINLESS_RUNTIME_VERSION = exports.CLAUDE_CODE_STAINLESS_PACKAGE_VERSION = exports.CLAUDE_CODE_USER_AGENT = exports.CODEX_CLI_USER_AGENT = exports.CODEX_CLI_ORIGINATOR = exports.CODEX_CLI_VERSION = void 0;
exports.claudeCodeStainlessArch = claudeCodeStainlessArch;
exports.claudeCodeStainlessOs = claudeCodeStainlessOs;
exports.CODEX_CLI_VERSION = '0.159.2';
exports.CODEX_CLI_ORIGINATOR = 'codex_cli_rs';
exports.CODEX_CLI_USER_AGENT = 'codex_cli_rs/0.0.0 (Unknown 0; unknown) unknown';
exports.CLAUDE_CODE_USER_AGENT = 'claude-cli/2.1.280 (external, sdk-cli)';
exports.CLAUDE_CODE_STAINLESS_PACKAGE_VERSION = '0.80.0';
exports.CLAUDE_CODE_STAINLESS_RUNTIME_VERSION = 'v24.14.0';
exports.CLAUDE_CODE_BETA_FLAGS = [
    'claude-code-20250219',
    'oauth-2025-04-20',
    'context-management-2025-06-27',
    'effort-2025-11-24',
].join(',');
function claudeCodeStainlessArch(arch = process.arch) {
    switch (arch) {
        case 'arm64':
            return 'arm64';
        case 'x64':
            return 'x64';
        default:
            return `Other:${arch}`;
    }
}
function claudeCodeStainlessOs(platform = process.platform) {
    switch (platform) {
        case 'darwin':
            return 'MacOS';
        case 'linux':
            return 'Linux';
        case 'win32':
            return 'Windows';
        case 'freebsd':
            return 'FreeBSD';
        default:
            return `Other:${platform}`;
    }
}
const buildClaudeCodeSubscriptionHeaders = (apiKey) => ({
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
    'anthropic-beta': exports.CLAUDE_CODE_BETA_FLAGS,
    'anthropic-dangerous-direct-browser-access': 'true',
    'user-agent': exports.CLAUDE_CODE_USER_AGENT,
    'x-app': 'cli',
    'x-stainless-arch': claudeCodeStainlessArch(),
    'x-stainless-helper-method': 'stream',
    'x-stainless-lang': 'js',
    'x-stainless-os': claudeCodeStainlessOs(),
    'x-stainless-package-version': exports.CLAUDE_CODE_STAINLESS_PACKAGE_VERSION,
    'x-stainless-retry-count': '0',
    'x-stainless-runtime': 'node',
    'x-stainless-runtime-version': exports.CLAUDE_CODE_STAINLESS_RUNTIME_VERSION,
    'x-stainless-timeout': '600',
});
exports.buildClaudeCodeSubscriptionHeaders = buildClaudeCodeSubscriptionHeaders;
exports.COPILOT_EDITOR_VERSION = 'vscode/1.100.0';
exports.COPILOT_PLUGIN_VERSION = 'copilot/1.300.0';
//# sourceMappingURL=subscription-clients.js.map