"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPlanEmail = SubscriptionPlanEmail;
exports.PlanUsageEmail = PlanUsageEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const dashboard_url_1 = require("../../common/utils/dashboard-url");
const components_1 = require("@react-email/components");
function greeting(name) {
    const trimmed = name?.trim();
    return trimmed ? `Hi ${trimmed},` : 'Hi,';
}
function formatCount(value) {
    return Math.round(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
}
function formatDate(raw) {
    if (!raw)
        return null;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime()))
        return raw;
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    });
}
function accountUrl(appUrl) {
    return `${appUrl.replace(/\/+$/, '')}/account`;
}
function emailPreferencesUrl(appUrl) {
    return `${accountUrl(appUrl)}#email-preferences`;
}
function subscriptionCopy(props) {
    if (props.kind === 'plan_changed') {
        return {
            preview: `Your Manifest plan changed to ${props.planName}`,
            badge: '',
            heading: `Your plan is now Manifest ${props.planName}`,
            body: ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [greeting(props.userName), " your plan has been updated", props.previousPlanName ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [' ', "from ", (0, jsx_runtime_1.jsx)("strong", { children: props.previousPlanName })] })) : null, ' ', "to ", (0, jsx_runtime_1.jsx)("strong", { children: props.planName }), ". Here's what you now have access to:"] })),
            features: [
                'Unlimited routed requests',
                '365 days dashboard retention',
                'Basic support (platform issues, billing, licence activation)',
            ],
            cta: 'Open Manifest',
        };
    }
    if (props.kind === 'cancellation_confirmed') {
        const end = formatDate(props.periodEnd);
        return {
            preview: end
                ? `Your Manifest ${props.planName} plan is scheduled to end on ${end}`
                : `Your Manifest ${props.planName} plan is scheduled to end`,
            badge: '',
            heading: `${props.planName} cancellation confirmed`,
            body: 'multi',
            paragraphs: [
                (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [greeting(props.userName), " we're sorry to see you go. Your", ' ', (0, jsx_runtime_1.jsx)("strong", { children: props.planName }), " cancellation has been confirmed. You'll keep full access to ", props.planName, " features", end ? ` until ${end}` : '', "."] }),
                (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: "After that date, your workspace will switch back to the Free plan with 10,000 routed requests per month and 7-day dashboard retention." }),
                (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: "If there's anything we can do, or if you'd like to discuss your needs, we're here to help." }),
            ],
            cta: 'Manage billing',
            ctaSecondary: 'Talk to sales',
        };
    }
    return {
        preview: `Your Manifest ${props.planName} plan is active`,
        badge: '',
        heading: `Welcome to Manifest ${props.planName}`,
        body: ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [greeting(props.userName), " your ", (0, jsx_runtime_1.jsx)("strong", { children: props.planName }), " plan is active. The whole team warmly thanks you for your trust. Here's what you now have access to:"] })),
        features: [
            'Unlimited routed requests',
            '365 days dashboard retention',
            'Basic support (platform issues, billing, licence activation)',
        ],
        cta: 'Open Manifest',
    };
}
function SubscriptionPlanEmail(props) {
    const logoUrl = props.logoUrl ?? (0, dashboard_url_1.getEmailAssetUrl)('manifest-logo.png', props.appUrl);
    const copy = subscriptionCopy(props);
    const accent = props.kind === 'cancellation_confirmed' ? '#ea580c' : '#0f766e';
    const accentBg = props.kind === 'cancellation_confirmed' ? '#fff7ed' : '#ecfdf5';
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Head, {}), (0, jsx_runtime_1.jsx)(components_1.Preview, { children: copy.preview }), (0, jsx_runtime_1.jsx)(components_1.Body, { style: body, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { style: container, children: [(0, jsx_runtime_1.jsx)(components_1.Section, { style: logoSection, children: (0, jsx_runtime_1.jsx)(components_1.Img, { src: logoUrl, alt: "Manifest LLM Gateway", width: "174", height: "32", style: logoImg }) }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: card, children: [(0, jsx_runtime_1.jsx)(components_1.Text, { style: heading, children: copy.heading }), copy.paragraphs ? (copy.paragraphs.map((p, i) => ((0, jsx_runtime_1.jsx)(components_1.Text, { style: paragraph, children: p }, i)))) : ((0, jsx_runtime_1.jsx)(components_1.Text, { style: paragraph, children: copy.body })), copy.features && copy.features.length > 0 && ((0, jsx_runtime_1.jsx)(components_1.Section, { style: { margin: '0 0 24px' }, children: copy.features.map((feature) => ((0, jsx_runtime_1.jsxs)(components_1.Text, { style: featureItem, children: [(0, jsx_runtime_1.jsx)("span", { style: { color: '#2632EF' }, children: "\u2713" }), " ", feature] }, feature))) })), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: buttonContainer, children: [(0, jsx_runtime_1.jsx)(components_1.Button, { style: button, href: props.kind === 'subscription_confirmed' ? props.appUrl : props.manageBillingUrl, children: copy.cta }), copy.ctaSecondary && ((0, jsx_runtime_1.jsx)(components_1.Button, { style: buttonSecondary, href: "https://manifest.build/pricing", children: copy.ctaSecondary }))] }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: hint, children: "This email confirms a Manifest plan change only. Stripe may send payment receipts separately." })] }), (0, jsx_runtime_1.jsx)(Footer, { preferencesUrl: emailPreferencesUrl(props.appUrl) })] }) })] }));
}
function PlanUsageEmail(props) {
    const logoUrl = props.logoUrl ?? (0, dashboard_url_1.getEmailAssetUrl)('manifest-logo.png', props.appUrl);
    const isLimit = props.kind === 'requests_limit_reached';
    const percentage = Math.min(100, Math.round((props.used / props.limit) * 100));
    const accent = isLimit ? '#dc2626' : '#ea580c';
    const accentBg = isLimit ? '#fef2f2' : '#fff7ed';
    const reset = formatDate(props.periodEnd);
    const title = isLimit ? 'Monthly request limit reached' : '80% of monthly requests used';
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Head, {}), (0, jsx_runtime_1.jsx)(components_1.Preview, { children: isLimit
                    ? `Your Manifest workspace reached ${formatCount(props.limit)} monthly requests`
                    : `Your Manifest workspace used ${percentage}% of monthly requests` }), (0, jsx_runtime_1.jsx)(components_1.Body, { style: body, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { style: container, children: [(0, jsx_runtime_1.jsx)(components_1.Section, { style: logoSection, children: (0, jsx_runtime_1.jsx)(components_1.Img, { src: logoUrl, alt: "Manifest LLM Gateway", width: "174", height: "32", style: logoImg }) }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: card, children: [(0, jsx_runtime_1.jsx)(components_1.Text, { style: heading, children: title }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: paragraph, children: [greeting(props.userName), " your workspace has used", ' ', (0, jsx_runtime_1.jsx)("strong", { children: formatCount(props.used) }), " of", ' ', (0, jsx_runtime_1.jsx)("strong", { children: formatCount(props.limit) }), " included requests this month."] }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: paragraph, children: isLimit
                                        ? `New routed requests are blocked until the limit resets${reset ? ` on ${reset}` : ''}.`
                                        : `Requests are still running. The limit resets${reset ? ` on ${reset}` : ' at the start of next month'}.` }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: paragraph, children: isLimit
                                        ? 'Upgrade to Pro for unlimited requests.'
                                        : `If you reach ${formatCount(props.limit)}, new requests will stop being routed until the next period. To avoid interruptions, stay within your limit or upgrade to Pro for unlimited requests.` }), (0, jsx_runtime_1.jsx)(components_1.Section, { style: buttonContainer, children: (0, jsx_runtime_1.jsx)(components_1.Button, { style: button, href: `${props.appUrl.replace(/\/+$/, '')}/upgrade`, children: "Review plan" }) })] }), (0, jsx_runtime_1.jsx)(Footer, { preferencesUrl: emailPreferencesUrl(props.appUrl) })] }) })] }));
}
function Footer(props) {
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(components_1.Hr, { style: divider }), (0, jsx_runtime_1.jsx)(components_1.Section, { style: footer, children: (0, jsx_runtime_1.jsxs)(components_1.Text, { style: footerMuted, children: [(0, jsx_runtime_1.jsx)(components_1.Link, { href: props.preferencesUrl, style: footerLink, children: "Manage email preferences" }), ' · ', "(c) 2026 MNFST Inc.", ' ', (0, jsx_runtime_1.jsx)(components_1.Link, { href: "https://manifest.build", style: footerLink, children: "manifest.build" })] }) })] }));
}
const brandBg = '#f8f6f1';
const brandCardBg = '#ffffff';
const brandFg = '#020817';
const brandMuted = '#64748b';
const brandBorder = '#e5dfd6';
const brandPrimary = '#0f172a';
const brandPrimaryFg = '#f9f8f5';
const brandFont = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const body = {
    backgroundColor: brandBg,
    fontFamily: brandFont,
    margin: 0,
    padding: 0,
};
const container = {
    maxWidth: '520px',
    margin: '0 auto',
    padding: '40px 20px',
};
const logoSection = {
    textAlign: 'left',
    paddingBottom: '32px',
};
const logoImg = {};
const card = {
    backgroundColor: brandCardBg,
    borderRadius: '12px',
    padding: '40px 36px',
    border: `1px solid ${brandBorder}`,
};
const badge = {
    display: 'inline-block',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 700,
    padding: '5px 10px',
    margin: '0 0 16px',
};
const heading = {
    fontSize: '22px',
    fontWeight: 700,
    color: brandFg,
    margin: '0 0 12px',
    lineHeight: '1.3',
};
const paragraph = {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#374151',
    margin: '0 0 24px',
};
const buttonContainer = {
    textAlign: 'left',
    margin: '28px 0 0',
};
const button = {
    backgroundColor: brandPrimary,
    color: brandPrimaryFg,
    fontSize: '13px',
    fontWeight: 600,
    padding: '8px 16px',
    borderRadius: '6px',
    textDecoration: 'none',
    display: 'inline-block',
    lineHeight: '1',
};
const buttonSecondary = {
    backgroundColor: 'transparent',
    color: brandFg,
    fontSize: '13px',
    fontWeight: 600,
    padding: '8px 16px',
    borderRadius: '6px',
    border: `1px solid ${brandBorder}`,
    textDecoration: 'none',
    display: 'inline-block',
    lineHeight: '1',
    marginLeft: '8px',
};
const featureItem = {
    fontSize: '14px',
    lineHeight: '1.5',
    color: brandFg,
    margin: '0 0 6px',
    padding: '0',
};
const hint = {
    fontSize: '13px',
    lineHeight: '1.5',
    color: brandMuted,
    margin: '24px 0 0',
};
const notice = {
    border: '1px solid',
    borderRadius: '8px',
    padding: '14px 16px',
    margin: '0 0 8px',
};
const noticeText = {
    fontSize: '14px',
    lineHeight: '1.5',
    margin: 0,
};
const divider = {
    borderColor: brandBorder,
    borderTop: 'none',
    margin: '32px 0 24px',
};
const footer = {
    textAlign: 'center',
};
const footerMuted = {
    fontSize: '12px',
    color: '#94a3b8',
    margin: 0,
};
const footerLink = {
    color: '#94a3b8',
    textDecoration: 'underline',
};
//# sourceMappingURL=billing-plan-email.js.map