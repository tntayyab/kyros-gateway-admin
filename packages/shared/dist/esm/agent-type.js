export const AGENT_CATEGORIES = ['personal', 'automation', 'app', 'coding'];
export const AGENT_PLATFORMS = [
    'openclaw',
    'hermes',
    'nanobot',
    'craft',
    'n8n',
    'claude-code',
    'opencode',
    'codex',
    'openai-sdk',
    'anthropic-sdk',
    'vercel-ai-sdk',
    'langchain',
    'curl',
    'other',
];
const AGENT_PLATFORM_SET = new Set(AGENT_PLATFORMS);
/** Coerce persisted or untrusted platform values to the closed public enum. */
export function coerceAgentPlatform(value) {
    return value && AGENT_PLATFORM_SET.has(value) ? value : 'other';
}
export const CATEGORY_LABELS = {
    personal: 'AI agent',
    automation: 'Automation',
    app: 'App AI SDK',
    coding: 'Coding Assistant',
};
/**
 * Which proxy surface a platform's NATIVE traffic speaks. Single source of
 * truth for anything that impersonates or reasons about platform traffic
 * (CLI `routing test`, Wingman profiles, docs). Adding a platform above
 * without a surface here is a type error — the mapping can never go stale.
 */
export const API_SURFACES = ['chat_completions', 'messages', 'responses'];
export const PLATFORM_API_SURFACES = {
    openclaw: 'chat_completions',
    hermes: 'chat_completions',
    nanobot: 'chat_completions',
    craft: 'chat_completions',
    n8n: 'chat_completions',
    'claude-code': 'messages',
    opencode: 'chat_completions',
    codex: 'responses',
    'openai-sdk': 'chat_completions',
    'anthropic-sdk': 'messages',
    'vercel-ai-sdk': 'chat_completions',
    langchain: 'chat_completions',
    curl: 'chat_completions',
    other: 'chat_completions',
};
export const PLATFORM_LABELS = {
    openclaw: 'OpenClaw',
    hermes: 'Hermes Agent',
    nanobot: 'Nanobot',
    craft: 'Craft Agent',
    n8n: 'n8n',
    'claude-code': 'Claude Code',
    opencode: 'OpenCode',
    codex: 'Codex',
    'openai-sdk': 'OpenAI SDK',
    'anthropic-sdk': 'Anthropic SDK',
    'vercel-ai-sdk': 'Vercel AI SDK',
    langchain: 'LangChain',
    curl: 'cURL',
    other: 'Other',
};
export const PLATFORMS_BY_CATEGORY = {
    personal: ['openclaw', 'hermes', 'nanobot', 'craft', 'other'],
    automation: ['n8n', 'other'],
    app: ['openai-sdk', 'anthropic-sdk', 'vercel-ai-sdk', 'langchain', 'other'],
    coding: ['claude-code', 'opencode', 'codex', 'other'],
};
export const PLATFORM_ICONS = {
    openclaw: '/icons/openclaw.svg',
    hermes: '/icons/hermes.svg',
    nanobot: '/icons/nanobot.png',
    craft: '/icons/craft.png',
    n8n: '/icons/n8n.svg',
    'claude-code': '/icons/providers/claude-code.svg',
    opencode: '/icons/providers/opencode.svg',
    codex: '/icons/providers/codex.svg',
    'openai-sdk': '/icons/providers/openai.svg',
    'anthropic-sdk': '/icons/providers/anthropic.svg',
    'vercel-ai-sdk': '/icons/vercel.svg',
    langchain: '/icons/langchain.svg',
    other: '/icons/other.svg',
};
export function platformIcon(platform, category) {
    if (!platform)
        return undefined;
    if (platform === 'other') {
        return category === 'personal' ? '/icons/other-agent.svg' : '/icons/other.svg';
    }
    // Object.hasOwn so a hostile string like "__proto__" or "constructor" can't
    // resolve to a value on Object.prototype.
    if (!Object.hasOwn(PLATFORM_ICONS, platform))
        return undefined;
    return PLATFORM_ICONS[platform];
}
//# sourceMappingURL=agent-type.js.map