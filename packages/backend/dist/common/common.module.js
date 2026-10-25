"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const tenant_entity_1 = require("../entities/tenant.entity");
const agent_entity_1 = require("../entities/agent.entity");
const ingest_event_bus_service_1 = require("./services/ingest-event-bus.service");
const manifest_runtime_service_1 = require("./services/manifest-runtime.service");
const tenant_cache_service_1 = require("./services/tenant-cache.service");
const user_cache_interceptor_1 = require("./interceptors/user-cache.interceptor");
const agent_cache_interceptor_1 = require("./interceptors/agent-cache.interceptor");
const agent_recording_config_service_1 = require("./services/agent-recording-config.service");
const request_recording_storage_service_1 = require("./services/request-recording-storage.service");
const agent_list_cache_interceptor_1 = require("./interceptors/agent-list-cache.interceptor");
const agent_list_cache_service_1 = require("./services/agent-list-cache.service");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([tenant_entity_1.Tenant, agent_entity_1.Agent])],
        providers: [
            ingest_event_bus_service_1.IngestEventBusService,
            manifest_runtime_service_1.ManifestRuntimeService,
            tenant_cache_service_1.TenantCacheService,
            user_cache_interceptor_1.UserCacheInterceptor,
            agent_cache_interceptor_1.AgentCacheInterceptor,
            agent_list_cache_interceptor_1.AgentListCacheInterceptor,
            agent_list_cache_service_1.AgentListCacheService,
            agent_recording_config_service_1.AgentRecordingConfigService,
            request_recording_storage_service_1.RequestRecordingStorageService,
        ],
        exports: [
            ingest_event_bus_service_1.IngestEventBusService,
            manifest_runtime_service_1.ManifestRuntimeService,
            tenant_cache_service_1.TenantCacheService,
            user_cache_interceptor_1.UserCacheInterceptor,
            agent_cache_interceptor_1.AgentCacheInterceptor,
            agent_list_cache_interceptor_1.AgentListCacheInterceptor,
            agent_list_cache_service_1.AgentListCacheService,
            agent_recording_config_service_1.AgentRecordingConfigService,
            request_recording_storage_service_1.RequestRecordingStorageService,
        ],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map