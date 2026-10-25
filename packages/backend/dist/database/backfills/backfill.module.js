"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackfillModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const backfill_state_entity_1 = require("../../entities/backfill-state.entity");
const message_provider_backfill_boot_service_1 = require("./message-provider-backfill.boot.service");
const request_backfill_boot_service_1 = require("./request-backfill.boot.service");
let BackfillModule = class BackfillModule {
};
exports.BackfillModule = BackfillModule;
exports.BackfillModule = BackfillModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([backfill_state_entity_1.BackfillState])],
        providers: [message_provider_backfill_boot_service_1.MessageProviderBackfillBootService, request_backfill_boot_service_1.RequestBackfillBootService],
    })
], BackfillModule);
//# sourceMappingURL=backfill.module.js.map