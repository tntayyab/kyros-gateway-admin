"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.authInstance = exports.authBaseURL = exports.mcpResources = exports.MCP_SCOPES = exports.MCP_WRITE_SCOPE = exports.MCP_READ_SCOPE = exports.mcpDisabledReason = exports.mcpEnabled = exports.mcpResource = exports.authIssuer = exports.authOrigin = void 0;
exports.authOriginForHost = authOriginForHost;
exports.authIssuerForHost = authIssuerForHost;
exports.mcpResourceForHost = mcpResourceForHost;
const better_auth_1 = require("better-auth");
const plugins_1 = require("better-auth/plugins");
const cimd_1 = require("@better-auth/cimd");
const mcp_1 = require("@better-auth/mcp");
const stripe_1 = require("@better-auth/stripe");
const render_1 = require("@react-email/render");
const verify_email_1 = require("../notifications/emails/verify-email");
const reset_password_1 = require("../notifications/emails/reset-password");
const send_email_1 = require("../notifications/services/email-providers/send-email");
const billing_config_1 = require("../billing/billing.config");
const env_util_1 = require("../config/env.util");
const subscription_webhook_emails_1 = require("../billing/subscription-webhook-emails");
const cimd_client_metadata_fetch_1 = require("./cimd-client-metadata-fetch");
const mcp_availability_1 = require("./mcp-availability");
const mcp_scopes_1 = require("./mcp-scopes");
const port = process.env['PORT'] ?? '3001';
const isDev = (process.env['NODE_ENV'] ?? '') !== 'production';
const hasEmailProvider = !!((process.env['EMAIL_PROVIDER'] && process.env['EMAIL_API_KEY']) ||
    (process.env['MAILGUN_API_KEY'] && process.env['MAILGUN_DOMAIN']));
exports.authOrigin = (0, mcp_availability_1.authOriginFromEnv)();
exports.authIssuer = `${exports.authOrigin}/api/auth`;
exports.mcpResource = `${exports.authOrigin}/api/v1/mcp`;
const mcpDecision = (0, mcp_availability_1.mcpAvailability)();
exports.mcpEnabled = mcpDecision.enabled;
exports.mcpDisabledReason = mcpDecision.reason;
var mcp_scopes_2 = require("./mcp-scopes");
Object.defineProperty(exports, "MCP_READ_SCOPE", { enumerable: true, get: function () { return mcp_scopes_2.MCP_READ_SCOPE; } });
Object.defineProperty(exports, "MCP_WRITE_SCOPE", { enumerable: true, get: function () { return mcp_scopes_2.MCP_WRITE_SCOPE; } });
Object.defineProperty(exports, "MCP_SCOPES", { enumerable: true, get: function () { return mcp_scopes_2.MCP_SCOPES; } });
const CLOUD_ORIGINS = ['https://app.manifest.build', 'https://gateway.manifest.build'];
const cloudOrigins = CLOUD_ORIGINS.includes(exports.authOrigin) ? CLOUD_ORIGINS : [];
exports.mcpResources = (cloudOrigins.length ? cloudOrigins : [exports.authOrigin]).map((origin) => `${origin}/api/v1/mcp`);
function authOriginForHost(host) {
    const normalizedHost = parseOriginHost(host);
    return ((cloudOrigins.length ? cloudOrigins : [exports.authOrigin]).find((origin) => new URL(origin).host === normalizedHost) ?? exports.authOrigin);
}
function authIssuerForHost(host) {
    return `${authOriginForHost(host)}/api/auth`;
}
function mcpResourceForHost(host) {
    return `${authOriginForHost(host)}/api/v1/mcp`;
}
function parseOriginHost(value) {
    const raw = value?.trim();
    if (!raw)
        return null;
    try {
        const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
        return url.host || null;
    }
    catch {
        return null;
    }
}
function buildAuthBaseURL() {
    if (isDev)
        return exports.authOrigin;
    const hosts = new Set();
    const add = (value) => {
        const host = parseOriginHost(value);
        if (host)
            hosts.add(host);
    };
    add(process.env['BETTER_AUTH_URL']);
    add(process.env['CORS_ORIGIN']);
    for (const origin of cloudOrigins)
        add(origin);
    for (const entry of (process.env['BETTER_AUTH_ALLOWED_HOSTS'] ?? '').split(','))
        add(entry);
    if (hosts.size <= 1)
        return exports.authOrigin;
    return {
        allowedHosts: [...hosts],
        fallback: exports.authOrigin,
        protocol: exports.authOrigin.startsWith('https://') ? 'https' : 'http',
    };
}
exports.authBaseURL = buildAuthBaseURL();
function createDatabaseConnection() {
    const { Pool } = require('pg');
    const databaseUrl = process.env['DATABASE_URL'] ?? 'postgresql://myuser:mypassword@localhost:5432/mydatabase';
    const max = (0, env_util_1.optionalPositiveInteger)(process.env['AUTH_DB_POOL_MAX']) ?? 5;
    return new Pool({ connectionString: databaseUrl, max, idleTimeoutMillis: 30000 });
}
const database = createDatabaseConnection();
const betterAuthSecret = process.env['BETTER_AUTH_SECRET'] ?? '';
const nodeEnv = process.env['NODE_ENV'] ?? '';
if (nodeEnv !== 'test' && (!betterAuthSecret || betterAuthSecret.length < 32)) {
    throw new Error('BETTER_AUTH_SECRET must be set to a value of at least 32 characters');
}
function buildTrustedOrigins() {
    const origins = [];
    if (process.env['BETTER_AUTH_URL']) {
        origins.push(process.env['BETTER_AUTH_URL']);
    }
    if (process.env['CORS_ORIGIN']) {
        origins.push(process.env['CORS_ORIGIN']);
    }
    origins.push(...cloudOrigins);
    if (isDev) {
        origins.push(`http://localhost:3000`, `http://127.0.0.1:3000`, `http://localhost:${port}`, `http://127.0.0.1:${port}`);
    }
    if (process.env['FRONTEND_PORT']) {
        origins.push(`http://localhost:${process.env['FRONTEND_PORT']}`, `http://127.0.0.1:${process.env['FRONTEND_PORT']}`);
    }
    return origins;
}
function buildPlugins() {
    const base = [(0, plugins_1.jwt)(), ...(exports.mcpEnabled ? buildMcpPlugins() : [])];
    if (!(0, billing_config_1.isBillingEnabled)())
        return base;
    const plans = [{ name: 'pro', priceId: process.env['STRIPE_PRO_PRICE_ID'] }];
    const priceToPlan = new Map(plans.map((plan) => [plan.priceId, plan.name]));
    return [
        ...base,
        (0, stripe_1.stripe)({
            stripeClient: (0, billing_config_1.getStripeClient)(),
            stripeWebhookSecret: process.env['STRIPE_WEBHOOK_SECRET'],
            subscription: {
                enabled: true,
                plans,
                onSubscriptionComplete: async ({ event, subscription }) => {
                    await (0, subscription_webhook_emails_1.sendSubscriptionConfirmedEmail)(database, event, subscription);
                },
                onSubscriptionCreated: async ({ event, subscription }) => {
                    await (0, subscription_webhook_emails_1.sendSubscriptionConfirmedEmail)(database, event, subscription);
                },
                onSubscriptionUpdate: async ({ event, subscription }) => {
                    const previousPlan = (0, subscription_webhook_emails_1.previousPlanFromEvent)(event, priceToPlan);
                    await (0, subscription_webhook_emails_1.sendPlanChangedEmail)(database, event, subscription, previousPlan);
                },
                onSubscriptionCancel: async ({ event, subscription }) => {
                    if (event)
                        await (0, subscription_webhook_emails_1.sendSubscriptionCanceledEmail)(database, event, subscription);
                },
                onSubscriptionDeleted: async ({ event, subscription }) => {
                    await (0, subscription_webhook_emails_1.sendSubscriptionCanceledEmail)(database, event, subscription);
                },
            },
        }),
    ];
}
function buildMcpPlugins() {
    return [
        (0, mcp_1.mcp)({
            loginPage: '/login',
            consentPage: '/consent',
            resource: exports.mcpResource,
            scopes: [...mcp_scopes_1.MCP_SCOPES, 'offline_access'],
            resources: exports.mcpResources.map((identifier) => ({
                identifier,
                name: 'Manifest MCP',
                accessTokenTtl: 15 * 60,
                allowedScopes: [...mcp_scopes_1.MCP_SCOPES, 'offline_access'],
            })),
            clientRegistrationDefaultResources: exports.mcpResources,
            resourceSeedMode: 'overwrite',
            clientRegistrationDefaultScopes: [mcp_scopes_1.MCP_READ_SCOPE],
            clientRegistrationAllowedScopes: [mcp_scopes_1.MCP_WRITE_SCOPE, 'offline_access'],
            allowDynamicClientRegistration: true,
            allowUnauthenticatedClientRegistration: false,
            clientRegistrationRequirePKCE: true,
        }),
        (0, cimd_1.cimd)({
            fetchClientMetadataResource: cimd_client_metadata_fetch_1.fetchClientMetadataResource,
            metadataProfile: 'mcp-2026-07-28',
        }),
    ];
}
const pluginAuth = (0, better_auth_1.betterAuth)({
    database,
    baseURL: exports.authBaseURL,
    basePath: '/api/auth',
    secret: betterAuthSecret,
    logger: { level: 'debug' },
    telemetry: { enabled: false },
    plugins: buildPlugins(),
    session: {
        cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ['google', 'github', 'discord'],
        },
    },
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        requireEmailVerification: !isDev && hasEmailProvider,
        sendResetPassword: async ({ user, url }) => {
            const element = (0, reset_password_1.ResetPasswordEmail)({
                userName: user.name,
                resetUrl: url,
            });
            const html = await (0, render_1.render)(element);
            const text = await (0, render_1.render)(element, { plainText: true });
            void (0, send_email_1.sendEmail)({
                to: user.email,
                subject: 'Reset your password',
                html,
                text,
            });
        },
    },
    emailVerification: {
        sendOnSignUp: hasEmailProvider,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            const element = (0, verify_email_1.VerifyEmailEmail)({
                userName: user.name,
                verificationUrl: url,
            });
            const html = await (0, render_1.render)(element);
            const text = await (0, render_1.render)(element, { plainText: true });
            void (0, send_email_1.sendEmail)({
                to: user.email,
                subject: 'Verify your email address',
                html,
                text,
            });
        },
    },
    socialProviders: {
        google: {
            clientId: process.env['GOOGLE_CLIENT_ID'] ?? '',
            clientSecret: process.env['GOOGLE_CLIENT_SECRET'] ?? '',
            enabled: !!(process.env['GOOGLE_CLIENT_ID'] && process.env['GOOGLE_CLIENT_SECRET']),
        },
        github: {
            clientId: process.env['GITHUB_CLIENT_ID'] ?? '',
            clientSecret: process.env['GITHUB_CLIENT_SECRET'] ?? '',
            enabled: !!(process.env['GITHUB_CLIENT_ID'] && process.env['GITHUB_CLIENT_SECRET']),
            scope: ['user:email'],
        },
        discord: {
            clientId: process.env['DISCORD_CLIENT_ID'] ?? '',
            clientSecret: process.env['DISCORD_CLIENT_SECRET'] ?? '',
            enabled: !!(process.env['DISCORD_CLIENT_ID'] && process.env['DISCORD_CLIENT_SECRET']),
            scope: ['identify', 'email'],
        },
    },
    trustedOrigins: buildTrustedOrigins(),
});
exports.authInstance = pluginAuth;
exports.auth = pluginAuth;
//# sourceMappingURL=auth.instance.js.map