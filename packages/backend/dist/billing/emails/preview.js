"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const render_1 = require("@react-email/render");
const React = __importStar(require("react"));
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const billing_plan_email_1 = require("./billing-plan-email");
const kind = (process.argv[2] ?? 'requests_warning');
const outPath = '/tmp/manifest-email-preview.html';
async function main() {
    let html;
    if (kind === 'requests_warning' || kind === 'requests_limit_reached') {
        html = await (0, render_1.render)(React.createElement(billing_plan_email_1.PlanUsageEmail, {
            kind: kind,
            userName: 'Sébastien',
            used: kind === 'requests_limit_reached' ? 10000 : 8200,
            limit: 10000,
            periodEnd: '2026-08-01T00:00:00.000Z',
            appUrl: 'http://localhost:37475',
        }));
    }
    else {
        html = await (0, render_1.render)(React.createElement(billing_plan_email_1.SubscriptionPlanEmail, {
            kind: kind,
            userName: 'Sébastien',
            planName: 'Pro',
            previousPlanName: kind === 'plan_changed' ? 'Free' : undefined,
            periodEnd: kind === 'cancellation_confirmed' ? '2026-08-06T00:00:00.000Z' : undefined,
            appUrl: 'http://localhost:37475',
            manageBillingUrl: 'http://localhost:37475/account',
        }));
    }
    (0, fs_1.writeFileSync)(outPath, html);
    console.log(`Preview written to ${outPath}`);
    (0, child_process_1.execSync)(`open ${outPath}`);
}
main();
//# sourceMappingURL=preview.js.map