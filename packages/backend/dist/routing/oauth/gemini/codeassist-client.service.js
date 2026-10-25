"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CodeAssistClientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeAssistClientService = void 0;
const common_1 = require("@nestjs/common");
const secret_scrub_1 = require("../../../common/utils/secret-scrub");
const CODE_ASSIST_BASE = 'https://cloudcode-pa.googleapis.com';
const CODE_ASSIST_VERSION = 'v1internal';
const CODE_ASSIST_OPERATION_POLL_MS = 5_000;
const CODE_ASSIST_OPERATION_MAX_POLLS = 12;
const CLIENT_METADATA = {
    ideType: 'IDE_UNSPECIFIED',
    platform: 'PLATFORM_UNSPECIFIED',
    pluginType: 'GEMINI',
    pluginVersion: '0.1.0',
};
let CodeAssistClientService = CodeAssistClientService_1 = class CodeAssistClientService {
    logger = new common_1.Logger(CodeAssistClientService_1.name);
    async onboard(accessToken) {
        const loaded = await this.callJson(':loadCodeAssist', accessToken, {
            metadata: CLIENT_METADATA,
        });
        const existingProject = loaded.cloudaicompanionProject;
        const currentTierId = loaded.currentTier?.id;
        if (existingProject && currentTierId) {
            return { projectId: existingProject, tierId: currentTierId };
        }
        const tier = loaded.allowedTiers?.find((t) => t.isDefault) ?? loaded.allowedTiers?.[0];
        if (!tier) {
            throw new Error('CodeAssist returned no allowed tiers — onboarding cannot proceed.');
        }
        const lro = await this.callJson(':onboardUser', accessToken, {
            tierId: tier.id,
            metadata: CLIENT_METADATA,
        });
        const completed = await this.waitForOperation(lro, accessToken);
        const projectId = completed.response?.cloudaicompanionProject?.id;
        if (!projectId) {
            throw new Error('CodeAssist onboardUser returned no project id.');
        }
        return { projectId, tierId: tier.id };
    }
    async waitForOperation(lro, accessToken) {
        let current = lro;
        for (let poll = 0; poll < CODE_ASSIST_OPERATION_MAX_POLLS && current.done !== true; poll++) {
            if (!current.name) {
                throw new Error('CodeAssist onboardUser operation returned no operation name.');
            }
            await new Promise((resolve) => setTimeout(resolve, CODE_ASSIST_OPERATION_POLL_MS));
            current = await this.callOperation(current.name, accessToken);
        }
        if (current.done !== true) {
            throw new Error('CodeAssist onboardUser operation did not complete.');
        }
        return current;
    }
    async callJson(method, accessToken, body) {
        const url = `${CODE_ASSIST_BASE}/${CODE_ASSIST_VERSION}${method}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const text = await response.text();
            this.logger.error(`CodeAssist ${method} failed (${response.status}): ${(0, secret_scrub_1.scrubSecrets)(text)}`);
            throw new Error(`CodeAssist ${method} failed (${response.status})`);
        }
        return (await response.json());
    }
    async callOperation(name, accessToken) {
        const url = `${CODE_ASSIST_BASE}/${CODE_ASSIST_VERSION}/${name}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const text = await response.text();
            this.logger.error(`CodeAssist operation ${name} failed (${response.status}): ${(0, secret_scrub_1.scrubSecrets)(text)}`);
            throw new Error(`CodeAssist operation ${name} failed (${response.status})`);
        }
        return (await response.json());
    }
};
exports.CodeAssistClientService = CodeAssistClientService;
exports.CodeAssistClientService = CodeAssistClientService = CodeAssistClientService_1 = __decorate([
    (0, common_1.Injectable)()
], CodeAssistClientService);
//# sourceMappingURL=codeassist-client.service.js.map