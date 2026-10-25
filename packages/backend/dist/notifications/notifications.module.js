"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notifications_controller_1 = require("./notifications.controller");
const notification_rules_service_1 = require("./services/notification-rules.service");
const notification_cron_service_1 = require("./services/notification-cron.service");
const notification_email_service_1 = require("./services/notification-email.service");
const email_provider_config_service_1 = require("./services/email-provider-config.service");
const notification_log_service_1 = require("./services/notification-log.service");
const limit_check_service_1 = require("./services/limit-check.service");
const notification_rule_entity_1 = require("../entities/notification-rule.entity");
const notification_log_entity_1 = require("../entities/notification-log.entity");
const agent_message_entity_1 = require("../entities/agent-message.entity");
const agent_entity_1 = require("../entities/agent.entity");
const tenant_entity_1 = require("../entities/tenant.entity");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([notification_rule_entity_1.NotificationRule, notification_log_entity_1.NotificationLog, agent_message_entity_1.AgentMessage, agent_entity_1.Agent, tenant_entity_1.Tenant]),
        ],
        controllers: [notifications_controller_1.NotificationsController],
        providers: [
            notification_rules_service_1.NotificationRulesService,
            notification_cron_service_1.NotificationCronService,
            notification_email_service_1.NotificationEmailService,
            email_provider_config_service_1.EmailProviderConfigService,
            notification_log_service_1.NotificationLogService,
            limit_check_service_1.LimitCheckService,
        ],
        exports: [limit_check_service_1.LimitCheckService],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map