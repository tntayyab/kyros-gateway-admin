"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CopilotDeviceAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopilotDeviceAuthService = void 0;
const common_1 = require("@nestjs/common");
const GITHUB_CLIENT_ID = 'Iv1.b507a08c87ecfe98';
const DEVICE_CODE_URL = 'https://github.com/login/device/code';
const ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
let CopilotDeviceAuthService = CopilotDeviceAuthService_1 = class CopilotDeviceAuthService {
    logger = new common_1.Logger(CopilotDeviceAuthService_1.name);
    async requestDeviceCode() {
        const res = await fetch(DEVICE_CODE_URL, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: GITHUB_CLIENT_ID,
                scope: 'read:user',
            }),
            signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) {
            throw new Error(`GitHub device code request failed: ${res.status}`);
        }
        const data = (await res.json());
        if (!data.device_code || !data.user_code) {
            throw new Error('Invalid device code response from GitHub');
        }
        return data;
    }
    async pollForToken(deviceCode) {
        const res = await fetch(ACCESS_TOKEN_URL, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: GITHUB_CLIENT_ID,
                device_code: deviceCode,
                grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            }),
            signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) {
            throw new Error(`GitHub token poll failed: ${res.status}`);
        }
        return this.parsePollResponse((await res.json()));
    }
    parsePollResponse(data) {
        if (data.access_token)
            return { status: 'complete', token: data.access_token };
        if (data.error === 'authorization_pending')
            return { status: 'pending' };
        if (data.error === 'slow_down')
            return { status: 'slow_down' };
        if (data.error === 'expired_token')
            return { status: 'expired' };
        if (data.error === 'access_denied')
            return { status: 'denied' };
        this.logger.warn(`Unexpected GitHub poll response: ${JSON.stringify(data)}`);
        return { status: 'pending' };
    }
};
exports.CopilotDeviceAuthService = CopilotDeviceAuthService;
exports.CopilotDeviceAuthService = CopilotDeviceAuthService = CopilotDeviceAuthService_1 = __decorate([
    (0, common_1.Injectable)()
], CopilotDeviceAuthService);
//# sourceMappingURL=copilot-device-auth.service.js.map