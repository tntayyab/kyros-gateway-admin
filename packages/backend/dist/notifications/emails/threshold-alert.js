"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThresholdAlertEmail = ThresholdAlertEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const dashboard_url_1 = require("../../common/utils/dashboard-url");
const components_1 = require("@react-email/components");
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatTimestamp(raw) {
    const [datePart, timePart] = raw.split(' ');
    if (!datePart || !timePart)
        return raw;
    const [, month, day] = datePart.split('-');
    if (!month || !day)
        return raw;
    const monthIdx = parseInt(month, 10) - 1;
    const monthName = MONTHS[monthIdx] ?? month;
    const dayNum = parseInt(day, 10);
    return `${monthName} ${dayNum}, ${timePart}`;
}
function formatValue(value, metric) {
    const num = Number(value);
    if (metric === 'cost')
        return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
function ThresholdAlertEmail(props) {
    const { agentName, metricType, threshold, actualValue, period, timestamp, agentUrl, logoUrl = (0, dashboard_url_1.getEmailAssetUrl)('manifest-logo.png'), alertType = 'hard', periodResetDate, } = props;
    const isSoft = alertType === 'soft';
    const accentColor = isSoft ? '#ea580c' : '#dc2626';
    const accentBg = isSoft ? '#fff7ed' : '#fef2f2';
    const accentBorder = isSoft ? '#fed7aa' : '#fecaca';
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Head, {}), (0, jsx_runtime_1.jsx)(components_1.Preview, { children: isSoft
                    ? `${agentName} exceeded ${metricType} threshold (${formatValue(actualValue, metricType)})`
                    : `${agentName} has been blocked — ${metricType} limit reached (${formatValue(actualValue, metricType)} / ${formatValue(threshold, metricType)})` }), (0, jsx_runtime_1.jsx)(components_1.Body, { style: body, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { style: container, children: [(0, jsx_runtime_1.jsx)(components_1.Section, { style: logoSection, children: (0, jsx_runtime_1.jsx)(components_1.Img, { src: logoUrl, alt: "Manifest LLM Gateway", width: "174", height: "32", style: logoImg }) }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: card, children: [(0, jsx_runtime_1.jsx)(components_1.Section, { style: alertBadgeContainer, children: (0, jsx_runtime_1.jsx)(components_1.Text, { style: { ...alertBadge, color: accentColor, backgroundColor: accentBg }, children: isSoft ? 'Warning' : 'Agent blocked' }) }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: heading, children: isSoft
                                        ? `${agentName} exceeded the ${metricType} limit`
                                        : `${agentName} has been blocked` }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: paragraph, children: isSoft ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Your agent ", (0, jsx_runtime_1.jsx)("strong", { children: agentName }), " has exceeded the", ' ', (0, jsx_runtime_1.jsx)("strong", { children: metricType }), " threshold for the current ", (0, jsx_runtime_1.jsx)("strong", { children: period }), ' ', "period."] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Your agent ", (0, jsx_runtime_1.jsx)("strong", { children: agentName }), " has reached the", ' ', (0, jsx_runtime_1.jsx)("strong", { children: metricType }), " limit of", ' ', (0, jsx_runtime_1.jsx)("strong", { children: formatValue(threshold, metricType) }), " per", ' ', (0, jsx_runtime_1.jsx)("strong", { children: period }), ". New requests are blocked to protect your budget."] })) }), isSoft ? ((0, jsx_runtime_1.jsx)(components_1.Text, { style: paragraph, children: "Requests are still being processed normally." })) : ((0, jsx_runtime_1.jsx)(components_1.Section, { style: { ...hardLimitBox, backgroundColor: accentBg, borderColor: accentBorder }, children: (0, jsx_runtime_1.jsxs)(components_1.Text, { style: { ...hardLimitText, color: accentColor }, children: ["Requests are now blocked until the next period resets", periodResetDate ? ` on ${formatTimestamp(periodResetDate)}` : '', "."] }) })), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: statsRow, children: [(0, jsx_runtime_1.jsxs)(components_1.Section, { style: statBox, children: [(0, jsx_runtime_1.jsx)(components_1.Text, { style: statLabel, children: "Threshold" }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: statValue, children: formatValue(threshold, metricType) })] }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: { ...statBoxAlert, backgroundColor: accentBg, borderColor: accentBorder }, children: [(0, jsx_runtime_1.jsx)(components_1.Text, { style: statLabel, children: isSoft ? 'Actual usage' : 'Current usage' }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: { ...statValueAlert, color: accentColor }, children: formatValue(actualValue, metricType) })] })] }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: metaRow, children: [(0, jsx_runtime_1.jsxs)(components_1.Text, { style: metaText, children: ["Period: ", period] }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: metaText, children: ["Triggered: ", formatTimestamp(timestamp)] })] }), (0, jsx_runtime_1.jsx)(components_1.Section, { style: ctaContainer, children: (0, jsx_runtime_1.jsx)(components_1.Button, { style: ctaButton, href: agentUrl, children: "View Agent Dashboard \u2192" }) })] }), (0, jsx_runtime_1.jsx)(components_1.Hr, { style: divider }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: footer, children: [(0, jsx_runtime_1.jsx)(components_1.Text, { style: footerNote, children: "You are receiving this because you set up a notification rule in Manifest." }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: footerMuted, children: ["\u00A9 2026 MNFST Inc. All rights reserved.", ' ', (0, jsx_runtime_1.jsx)(components_1.Link, { href: "https://manifest.build", style: footerLink, children: "manifest.build" })] })] })] }) })] }));
}
const brandBg = '#f8f6f1';
const brandCardBg = '#ffffff';
const brandFg = '#020817';
const brandMuted = '#64748b';
const brandBorder = '#e5dfd6';
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
    textAlign: 'center',
    paddingBottom: '32px',
};
const logoImg = {
    margin: '0 auto',
};
const card = {
    backgroundColor: brandCardBg,
    borderRadius: '12px',
    padding: '40px 36px',
    border: `1px solid ${brandBorder}`,
};
const alertBadgeContainer = {
    marginBottom: '16px',
};
const alertBadge = {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '4px 10px',
    borderRadius: '6px',
    margin: 0,
};
const heading = {
    fontSize: '22px',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: brandFg,
    margin: '0 0 12px',
    lineHeight: '1.3',
};
const paragraph = {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#374151',
    margin: '0 0 28px',
};
const statsRow = {
    marginBottom: '24px',
};
const statBox = {
    backgroundColor: '#fafaf9',
    borderRadius: '8px',
    padding: '16px 20px',
    marginBottom: '8px',
    border: `1px solid ${brandBorder}`,
};
const statBoxAlert = {
    borderRadius: '8px',
    padding: '16px 20px',
    border: '1px solid',
};
const hardLimitBox = {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '28px',
};
const hardLimitText = {
    fontSize: '14px',
    fontWeight: 700,
    margin: 0,
    lineHeight: '1.5',
};
const statLabel = {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: brandMuted,
    margin: '0 0 4px',
};
const statValue = {
    fontSize: '24px',
    fontWeight: 700,
    color: brandFg,
    margin: 0,
    letterSpacing: '-0.02em',
};
const statValueAlert = {
    fontSize: '24px',
    fontWeight: 700,
    margin: 0,
    letterSpacing: '-0.02em',
};
const metaRow = {
    padding: '12px 0 0',
};
const metaText = {
    fontSize: '12px',
    color: brandMuted,
    margin: '0 0 2px',
};
const ctaContainer = {
    textAlign: 'center',
    marginTop: '28px',
};
const ctaButton = {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    padding: '12px 28px',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
};
const divider = {
    borderColor: brandBorder,
    borderTop: 'none',
    margin: '32px 0 24px',
};
const footer = {
    textAlign: 'center',
};
const footerNote = {
    fontSize: '12px',
    color: '#94a3b8',
    margin: '0 0 16px',
    lineHeight: '1.5',
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
//# sourceMappingURL=threshold-alert.js.map