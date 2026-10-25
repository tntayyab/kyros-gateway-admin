"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBillingEnabled = isBillingEnabled;
exports.getStripeClient = getStripeClient;
const stripe_1 = __importDefault(require("stripe"));
const detect_self_hosted_1 = require("../common/utils/detect-self-hosted");
function isBillingEnabled() {
    return (!(0, detect_self_hosted_1.isSelfHosted)() &&
        !!process.env['STRIPE_SECRET_KEY'] &&
        !!process.env['STRIPE_WEBHOOK_SECRET'] &&
        !!process.env['STRIPE_PRO_PRICE_ID']);
}
let stripeClient = null;
function getStripeClient() {
    if (!stripeClient) {
        stripeClient = new stripe_1.default(process.env['STRIPE_SECRET_KEY']);
    }
    return stripeClient;
}
//# sourceMappingURL=billing.config.js.map