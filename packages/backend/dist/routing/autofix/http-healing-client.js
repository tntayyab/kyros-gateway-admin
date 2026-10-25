"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpHealingClient = void 0;
const common_1 = require("@nestjs/common");
const healing_client_1 = require("./healing-client");
class HttpHealingClient {
    timeoutMs;
    apiKey;
    instanceId;
    manifestVersion;
    logger = new common_1.Logger(HttpHealingClient.name);
    baseUrl;
    constructor(baseUrl, timeoutMs, apiKey, instanceId, manifestVersion) {
        this.timeoutMs = timeoutMs;
        this.apiKey = apiKey;
        this.instanceId = instanceId;
        this.manifestVersion = manifestVersion;
        this.baseUrl = baseUrl.trim().replace(/\/+$/, '');
    }
    async heal(input, context) {
        const res = await this.authenticatedFetch('/api/heal', {
            method: 'POST',
            body: JSON.stringify(input),
        }, context);
        if (!res.ok) {
            await res.body?.cancel();
            const message = `Phoenix /api/heal responded ${res.status}`;
            if (res.status >= 400 && res.status < 500) {
                throw new healing_client_1.HealContractError(res.status, message);
            }
            throw new Error(message);
        }
        return (await res.json());
    }
    async observe(observations, context) {
        if (observations.length === 0)
            return;
        try {
            const res = await this.authenticatedFetch('/api/heal/observe', {
                method: 'POST',
                body: JSON.stringify({ observations }),
            }, context);
            await res.body?.cancel();
            if (!res.ok) {
                this.logger.warn(`Phoenix /api/heal/observe responded ${res.status}`);
            }
        }
        catch (err) {
            this.logger.warn(`Phoenix /api/heal/observe failed: ${err.message}`);
        }
    }
    async reportOutcome(healAttemptId, outcome, context) {
        try {
            const path = `/api/heal-attempts/${encodeURIComponent(healAttemptId)}`;
            const res = await this.authenticatedFetch(path, {
                method: 'PATCH',
                body: JSON.stringify(outcome),
            }, context);
            if (!res.ok) {
                await res.body?.cancel();
                this.logger.warn(`Phoenix heal-attempt ${healAttemptId} responded ${res.status}`);
                return null;
            }
            return (await res.json());
        }
        catch (err) {
            this.logger.warn(`Phoenix heal-attempt ${healAttemptId} failed: ${err.message}`);
            return null;
        }
    }
    async authenticatedFetch(path, init, context) {
        if (this.apiKey) {
            return this.request(path, init, {
                'content-type': 'application/json',
                'x-api-key': this.apiKey,
                'X-Manifest-Version': this.manifestVersion ?? 'unknown',
            });
        }
        if (!this.instanceId) {
            return this.request(path, init, { 'content-type': 'application/json' });
        }
        if (!context) {
            throw new Error('Autofix harness is required for instance-identified requests');
        }
        return this.request(path, init, this.instanceHeaders(await this.instanceId(), context));
    }
    request(path, init, headers) {
        return fetch(`${this.baseUrl}${path}`, {
            ...init,
            headers,
            signal: AbortSignal.timeout(this.timeoutMs),
        });
    }
    instanceHeaders(instanceId, context) {
        return {
            'content-type': 'application/json',
            'X-Manifest-Instance': instanceId,
            'X-Manifest-Version': this.manifestVersion ?? 'unknown',
            'X-Manifest-Harness': context.harness,
        };
    }
}
exports.HttpHealingClient = HttpHealingClient;
//# sourceMappingURL=http-healing-client.js.map