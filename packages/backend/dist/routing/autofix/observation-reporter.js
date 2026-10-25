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
var ObservationReporter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservationReporter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const autofix_service_1 = require("./autofix.service");
const healing_client_1 = require("./healing-client");
const observation_payload_1 = require("./observation-payload");
const BATCH_MAX = 50;
const FLUSH_INTERVAL_MS = 2_000;
const MAX_QUEUE = 500;
const MAX_IN_FLIGHT_GATES = 100;
let ObservationReporter = ObservationReporter_1 = class ObservationReporter {
    client;
    autofix;
    logger = new common_1.Logger(ObservationReporter_1.name);
    enabled;
    queue = [];
    inFlight = new Set();
    timer = null;
    dropped = 0;
    constructor(client, autofix, config) {
        this.client = client;
        this.autofix = autofix;
        this.enabled = config.get('AUTOFIX_REPORT_ALL_4XX')?.trim() === 'true';
        this.logger.log(`config: enabled=${this.enabled}`);
    }
    report(input) {
        if (!this.enabled)
            return;
        if (this.inFlight.size >= MAX_IN_FLIGHT_GATES) {
            this.countDrop();
            return;
        }
        const pending = this.gateAndEnqueue(input).finally(() => {
            this.inFlight.delete(pending);
        });
        this.inFlight.add(pending);
    }
    countDrop() {
        this.dropped += 1;
        if (this.dropped % 100 === 0) {
            this.logger.warn(`observation feed saturated — dropped ${this.dropped} so far`);
        }
    }
    async gateAndEnqueue(input) {
        try {
            const observation = (0, observation_payload_1.toObservation)(input);
            if (!observation)
                return;
            const context = await this.autofix.getHealingContext(input.tenantId, input.agentId);
            if (!context)
                return;
            this.enqueue({ observation, context });
        }
        catch (err) {
            this.logger.warn(`observation dropped: ${err.message}`);
        }
    }
    enqueue(observation) {
        if (this.queue.length >= MAX_QUEUE) {
            this.queue.shift();
            this.countDrop();
        }
        this.queue.push(observation);
        if (this.queue.length >= BATCH_MAX) {
            void this.flush();
            return;
        }
        this.scheduleFlush();
    }
    scheduleFlush() {
        if (this.timer)
            return;
        this.timer = setTimeout(() => {
            this.timer = null;
            void this.flush();
        }, FLUSH_INTERVAL_MS);
        this.timer.unref?.();
    }
    async flush() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.queue.length === 0)
            return;
        const context = this.queue[0].context;
        const batch = [];
        const remaining = [];
        for (const item of this.queue) {
            if (batch.length < BATCH_MAX && item.context.harness === context.harness) {
                batch.push(item);
            }
            else {
                remaining.push(item);
            }
        }
        this.queue = remaining;
        try {
            await this.client.observe(batch.map((item) => item.observation), context);
        }
        catch (err) {
            this.logger.warn(`observe batch of ${batch.length} failed: ${err.message}`);
        }
        if (this.queue.length > 0)
            this.scheduleFlush();
    }
    async onModuleDestroy() {
        await Promise.allSettled([...this.inFlight]);
        while (this.queue.length > 0)
            await this.flush();
    }
};
exports.ObservationReporter = ObservationReporter;
exports.ObservationReporter = ObservationReporter = ObservationReporter_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(healing_client_1.HEALING_CLIENT)),
    __metadata("design:paramtypes", [Object, autofix_service_1.AutofixService,
        config_1.ConfigService])
], ObservationReporter);
//# sourceMappingURL=observation-reporter.js.map