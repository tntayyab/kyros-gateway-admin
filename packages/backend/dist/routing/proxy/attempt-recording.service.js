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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttemptRecordingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const request_recording_storage_service_1 = require("../../common/services/request-recording-storage.service");
const request_recording_codec_1 = require("../../common/utils/request-recording-codec");
let AttemptRecordingService = class AttemptRecordingService {
    attemptRepo;
    storage;
    constructor(attemptRepo, storage) {
        this.attemptRepo = attemptRepo;
        this.storage = storage;
    }
    get available() {
        return this.storage.backend !== null;
    }
    async save(tenantId, requestId, attemptId, payload) {
        const storageKey = this.storage.objectKey(tenantId, requestId, attemptId);
        let uploaded = false;
        try {
            const encoded = await (0, request_recording_codec_1.encodeRequestRecording)(payload);
            await this.storage.put(storageKey, encoded);
            uploaded = true;
            const result = await this.attemptRepo.update({ id: attemptId, tenant_id: tenantId, request_id: requestId }, { recording_key: storageKey });
            if (result.affected === 0) {
                throw new Error(`Provider Attempt ${attemptId} no longer exists`);
            }
        }
        catch (error) {
            if (uploaded)
                await this.storage.delete(storageKey).catch(() => undefined);
            throw error;
        }
    }
};
exports.AttemptRecordingService = AttemptRecordingService;
exports.AttemptRecordingService = AttemptRecordingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        request_recording_storage_service_1.RequestRecordingStorageService])
], AttemptRecordingService);
//# sourceMappingURL=attempt-recording.service.js.map