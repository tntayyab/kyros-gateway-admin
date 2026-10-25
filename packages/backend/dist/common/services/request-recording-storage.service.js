"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RequestRecordingStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestRecordingStorageService = exports.S3RecordingStorage = void 0;
exports.resolveRecordingStorage = resolveRecordingStorage;
const client_s3_1 = require("@aws-sdk/client-s3");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const detect_self_hosted_1 = require("../utils/detect-self-hosted");
function storageKeySegment(value) {
    if (!value)
        throw new Error('Request recording storage key segments cannot be empty');
    return encodeURIComponent(value).replaceAll('.', '%2E');
}
function resolveRecordingStorage(config, selfHosted = (0, detect_self_hosted_1.isSelfHosted)(), cwd = process.cwd()) {
    const requested = (config.get('app.requestRecordingStorage') ?? 'auto').toLowerCase();
    const nodeEnv = config.get('app.nodeEnv') ?? 'development';
    const filesystemPath = config.get('app.requestRecordingFilesystemPath') ||
        (nodeEnv === 'production'
            ? '/data/request-recordings'
            : (0, node_path_1.join)(cwd, '.data', 'request-recordings'));
    const bucket = config.get('app.requestRecordingS3Bucket')?.trim() ?? '';
    const endpoint = config.get('app.requestRecordingS3Endpoint')?.trim() || undefined;
    const region = config.get('app.requestRecordingS3Region')?.trim() ?? '';
    const accessKeyId = config.get('app.requestRecordingS3AccessKeyId')?.trim() || undefined;
    const secretAccessKey = config.get('app.requestRecordingS3SecretAccessKey')?.trim() || undefined;
    const forcePathStyle = config.get('app.requestRecordingS3ForcePathStyle') ?? false;
    const hasExplicitCredentials = Boolean(accessKeyId && secretAccessKey);
    const hasPartialCredentials = Boolean(accessKeyId || secretAccessKey);
    const completeS3 = Boolean(bucket && region && (!hasPartialCredentials || hasExplicitCredentials));
    const s3 = () => completeS3
        ? {
            backend: 's3',
            bucket,
            endpoint,
            region,
            accessKeyId,
            secretAccessKey,
            forcePathStyle,
        }
        : {
            backend: null,
            reason: 'S3 recording storage requires a bucket, region, and either both access-key values or neither',
        };
    if (requested === 's3')
        return s3();
    if (requested === 'filesystem')
        return { backend: 'filesystem', path: filesystemPath };
    if (requested === 'disabled') {
        return { backend: null, reason: 'Recording storage was explicitly disabled' };
    }
    if (requested !== 'auto') {
        return {
            backend: null,
            reason: `Unknown REQUEST_RECORDING_STORAGE value "${requested}"`,
        };
    }
    if (bucket || region || hasPartialCredentials || endpoint)
        return s3();
    if (selfHosted || nodeEnv !== 'production') {
        return { backend: 'filesystem', path: filesystemPath };
    }
    return {
        backend: null,
        reason: 'Managed Cloud requires S3 recording storage credentials',
    };
}
class FilesystemRecordingStorage {
    backend = 'filesystem';
    root;
    constructor(root) {
        this.root = (0, node_path_1.resolve)(root);
    }
    async prepare() {
        await (0, promises_1.mkdir)(this.root, { recursive: true });
    }
    async put(key, body) {
        const target = this.pathFor(key);
        const temporary = `${target}.tmp`;
        await (0, promises_1.mkdir)((0, node_path_1.dirname)(target), { recursive: true });
        await (0, promises_1.writeFile)(temporary, body);
        await (0, promises_1.rename)(temporary, target);
    }
    async get(key) {
        return (0, promises_1.readFile)(this.pathFor(key));
    }
    async delete(key) {
        await (0, promises_1.rm)(this.pathFor(key), { force: true });
    }
    pathFor(key) {
        const target = (0, node_path_1.resolve)(this.root, key);
        if (target !== this.root && !target.startsWith(`${this.root}${node_path_1.sep}`)) {
            throw new Error('Invalid request recording storage key');
        }
        return target;
    }
}
class S3RecordingStorage {
    config;
    backend = 's3';
    client;
    constructor(config, client) {
        this.config = config;
        this.client =
            client ??
                new client_s3_1.S3Client({
                    region: config.region,
                    endpoint: config.endpoint,
                    forcePathStyle: config.forcePathStyle,
                    credentials: config.accessKeyId && config.secretAccessKey
                        ? {
                            accessKeyId: config.accessKeyId,
                            secretAccessKey: config.secretAccessKey,
                        }
                        : undefined,
                });
    }
    async prepare() { }
    async put(key, body) {
        await this.client.send(new client_s3_1.PutObjectCommand({
            Bucket: this.config.bucket,
            Key: key,
            Body: body,
            ContentType: 'application/octet-stream',
        }));
    }
    async get(key) {
        const response = await this.client.send(new client_s3_1.GetObjectCommand({ Bucket: this.config.bucket, Key: key }));
        if (!response.Body)
            throw new Error('Request recording object has no body');
        return Buffer.from(await response.Body.transformToByteArray());
    }
    async delete(key) {
        await this.client.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }));
    }
}
exports.S3RecordingStorage = S3RecordingStorage;
let RequestRecordingStorageService = RequestRecordingStorageService_1 = class RequestRecordingStorageService {
    logger = new common_1.Logger(RequestRecordingStorageService_1.name);
    storage;
    unavailableReason;
    constructor(config) {
        const resolved = resolveRecordingStorage(config);
        if (resolved.backend === 'filesystem') {
            this.storage = new FilesystemRecordingStorage(resolved.path);
            this.unavailableReason = null;
        }
        else if (resolved.backend === 's3') {
            this.storage = new S3RecordingStorage(resolved);
            this.unavailableReason = null;
        }
        else {
            this.storage = null;
            this.unavailableReason = resolved.reason;
        }
    }
    async onModuleInit() {
        if (!this.storage) {
            this.logger.warn(`Request recording storage unavailable: ${this.unavailableReason}`);
            return;
        }
        try {
            await this.storage.prepare();
            this.logger.log(`Request recording storage: ${this.storage.backend}`);
        }
        catch (error) {
            this.unavailableReason = error instanceof Error ? error.message : String(error);
            this.storage = null;
            this.logger.error(`Request recording storage unavailable: ${this.unavailableReason}`);
        }
    }
    get backend() {
        return this.storage?.backend ?? null;
    }
    objectKey(tenantId, requestId, attemptId) {
        return (`request-recordings/v1/tenants/${storageKeySegment(tenantId)}` +
            `/requests/${storageKeySegment(requestId)}` +
            `/attempts/${storageKeySegment(attemptId)}.json.gz`);
    }
    async put(key, body) {
        await this.requireStorage().put(key, body);
    }
    async get(key) {
        return this.requireStorage().get(key);
    }
    async delete(key) {
        await this.requireStorage().delete(key);
    }
    requireStorage() {
        if (!this.storage) {
            throw new Error(this.unavailableReason ?? 'Request recording storage is unavailable');
        }
        return this.storage;
    }
};
exports.RequestRecordingStorageService = RequestRecordingStorageService;
exports.RequestRecordingStorageService = RequestRecordingStorageService = RequestRecordingStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RequestRecordingStorageService);
//# sourceMappingURL=request-recording-storage.service.js.map