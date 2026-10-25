"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
const config_1 = require("@nestjs/config");
const env_util_1 = require("./env.util");
function resolveDatabaseUrl() {
    const url = process.env['DATABASE_URL'];
    if (url)
        return url;
    if (process.env['NODE_ENV'] === 'test')
        return 'postgresql://myuser:mypassword@localhost:5432/mydatabase';
    throw new Error('DATABASE_URL is required. Set it in your .env file.');
}
exports.appConfig = (0, config_1.registerAs)('app', () => ({
    port: Number(process.env['PORT'] ?? 3001),
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
    databaseUrl: resolveDatabaseUrl(),
    corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
    betterAuthUrl: process.env['BETTER_AUTH_URL'] ?? '',
    throttleTtl: Number(process.env['THROTTLE_TTL'] ?? 60000),
    throttleLimit: Number(process.env['THROTTLE_LIMIT'] ?? 100),
    apiKey: process.env['API_KEY'] ?? '',
    bindAddress: process.env['BIND_ADDRESS'] ?? '127.0.0.1',
    emailProvider: process.env['EMAIL_PROVIDER'] ?? '',
    emailApiKey: process.env['EMAIL_API_KEY'] ?? '',
    emailDomain: process.env['EMAIL_DOMAIN'] ?? '',
    emailFrom: process.env['EMAIL_FROM'] ?? process.env['NOTIFICATION_FROM_EMAIL'] ?? 'noreply@manifest.build',
    mailgunApiKey: process.env['MAILGUN_API_KEY'] ?? '',
    mailgunDomain: process.env['MAILGUN_DOMAIN'] ?? '',
    notificationFromEmail: process.env['NOTIFICATION_FROM_EMAIL'] ?? 'noreply@manifest.build',
    dbPoolMax: (0, env_util_1.optionalPositiveInteger)(process.env['DB_POOL_MAX']) ?? 10,
    dbTuneSession: process.env['DB_TUNE_SESSION'] !== 'false',
    runMigrationsOnBoot: process.env['RUN_MIGRATIONS_ON_BOOT'] !== 'false',
    shutdownDrainMs: Number(process.env['SHUTDOWN_DRAIN_MS'] ?? 10000),
    publicErrorPagesEnabled: process.env['MANIFEST_PUBLIC_STATS'] === 'true',
    requestRecordingRetentionDays: (0, env_util_1.optionalPositiveInteger)(process.env['REQUEST_RECORDING_RETENTION_DAYS']),
    requestRecordingStorage: process.env['REQUEST_RECORDING_STORAGE'] ?? 'auto',
    requestRecordingFilesystemPath: process.env['REQUEST_RECORDING_FILESYSTEM_PATH'] ?? '',
    requestRecordingS3Bucket: process.env['REQUEST_RECORDING_S3_BUCKET'] ?? '',
    requestRecordingS3Endpoint: process.env['REQUEST_RECORDING_S3_ENDPOINT'] ?? '',
    requestRecordingS3Region: process.env['REQUEST_RECORDING_S3_REGION'] ?? '',
    requestRecordingS3AccessKeyId: process.env['REQUEST_RECORDING_S3_ACCESS_KEY_ID'] ?? '',
    requestRecordingS3SecretAccessKey: process.env['REQUEST_RECORDING_S3_SECRET_ACCESS_KEY'] ?? '',
    requestRecordingS3ForcePathStyle: process.env['REQUEST_RECORDING_S3_FORCE_PATH_STYLE'] === 'true',
    errorPagePushSecret: process.env['ERROR_PAGE_PUSH_SECRET'] ?? '',
    crmMetricsSecret: process.env['CRM_METRICS_SECRET'] ?? '',
    cliTokenTtlDays: (0, env_util_1.optionalPositiveInteger)(process.env['CLI_TOKEN_TTL_DAYS']) ?? 30,
    cliTokenAbsoluteTtlDays: (0, env_util_1.optionalPositiveInteger)(process.env['CLI_TOKEN_ABSOLUTE_TTL_DAYS']) ?? 90,
}));
//# sourceMappingURL=app.config.js.map