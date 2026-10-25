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
exports.SeenHeadersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const TTL_MS = 5 * 60_000;
const MAX_ENTRIES = 200;
const WINDOW_DAYS = 7;
const MAX_KEYS = 50;
const MAX_VALUES_PER_KEY = 3;
let SeenHeadersService = class SeenHeadersService {
    messageRepo;
    cache = new Map();
    constructor(messageRepo) {
        this.messageRepo = messageRepo;
    }
    async getSeenHeaders(tenantId, agentName) {
        const cacheKey = `${tenantId}|${agentName ?? '*'}`;
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now())
            return cached.data;
        const filters = [
            `at.request_headers IS NOT NULL`,
            `at.timestamp > NOW() - INTERVAL '${WINDOW_DAYS} days'`,
        ];
        const params = [];
        params.push(tenantId);
        filters.push(`at.tenant_id = $${params.length}`);
        if (agentName) {
            params.push(agentName);
            filters.push(`at.agent_name = $${params.length}`);
        }
        const sql = `
      WITH expanded AS (
        SELECT hdr.key, hdr.value, (at.caller_attribution::json->>'sdk') AS sdk
        FROM agent_messages at,
             LATERAL jsonb_each_text(at.request_headers::jsonb) AS hdr(key, value)
        WHERE ${filters.join(' AND ')}
      ),
      value_freq AS (
        SELECT key, value, COUNT(*)::int AS freq
        FROM expanded
        GROUP BY key, value
      ),
      ranked_values AS (
        SELECT key, value, freq,
               ROW_NUMBER() OVER (PARTITION BY key ORDER BY freq DESC, value ASC) AS rn
        FROM value_freq
      )
      SELECT
        key,
        (SELECT SUM(freq)::int FROM value_freq v WHERE v.key = r.key) AS count,
        (SELECT array_agg(value ORDER BY rn)
         FROM ranked_values rv
         WHERE rv.key = r.key AND rv.rn <= ${MAX_VALUES_PER_KEY}) AS top_values,
        (SELECT array_remove(array_agg(DISTINCT sdk), NULL)
         FROM expanded e WHERE e.key = r.key) AS sdks
      FROM ranked_values r
      WHERE r.rn = 1
      ORDER BY count DESC
      LIMIT ${MAX_KEYS}
    `;
        const rows = (await this.messageRepo.query(sql, params));
        const data = rows.map((r) => ({
            key: r.key,
            count: r.count,
            top_values: r.top_values ?? [],
            sdks: r.sdks ?? [],
        }));
        this.putCache(cacheKey, data);
        return data;
    }
    putCache(key, data) {
        if (this.cache.size >= MAX_ENTRIES && !this.cache.has(key)) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined)
                this.cache.delete(firstKey);
        }
        this.cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
    }
};
exports.SeenHeadersService = SeenHeadersService;
exports.SeenHeadersService = SeenHeadersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SeenHeadersService);
//# sourceMappingURL=seen-headers.service.js.map