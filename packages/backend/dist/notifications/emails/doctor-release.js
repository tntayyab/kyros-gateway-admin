"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorReleaseEmail = DoctorReleaseEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const dashboard_url_1 = require("../../common/utils/dashboard-url");
const components_1 = require("@react-email/components");
function DoctorReleaseEmail(props) {
    const { appUrl, tutorialUrl, logoUrl = (0, dashboard_url_1.getEmailAssetUrl)('manifest-logo.png', props.appUrl), autofixIconUrl = (0, dashboard_url_1.getEmailAssetUrl)('autofix-icon-email.png', props.appUrl), } = props;
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Head, {}), (0, jsx_runtime_1.jsx)(components_1.Preview, { children: "Autofix is live on your account. Your failing requests can now repair themselves." }), (0, jsx_runtime_1.jsx)(components_1.Body, { style: body, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { style: container, children: [(0, jsx_runtime_1.jsx)(components_1.Section, { style: logoSection, children: (0, jsx_runtime_1.jsx)(components_1.Img, { src: logoUrl, alt: "Manifest LLM Gateway", width: "174", height: "32", style: logoImg }) }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: card, children: [(0, jsx_runtime_1.jsx)(components_1.Section, { style: badgeContainer, children: (0, jsx_runtime_1.jsxs)(components_1.Text, { style: newLine, children: [(0, jsx_runtime_1.jsx)("span", { style: newLabel, children: "New:" }), ' ', (0, jsx_runtime_1.jsx)(components_1.Img, { src: autofixIconUrl, alt: "", width: "18", height: "18", style: autofixIcon }), ' ', (0, jsx_runtime_1.jsx)("span", { style: autofixName, children: "Autofix" })] }) }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: heading, children: "Autofix is live on your account" }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: paragraph, children: "You joined the waitlist. Here it is: Autofix shipped today, and it is already running on your account. You have nothing to turn on." }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: paragraph, children: "From now on, when a provider rejects one of your requests with a fixable error, a renamed parameter, an unsupported field, a deprecated model, Manifest repairs the request and sends it again. Your agent gets its answer. You see the whole story in your dashboard: the failure, the fix, the retry." }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: paragraph, children: "Autofix learns from real traffic. Each new error we patch works for every account, so the share of requests it can repair grows week after week." }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: buttonSection, children: [(0, jsx_runtime_1.jsx)(components_1.Button, { href: appUrl, style: buttonPrimary, children: "Open your dashboard" }), tutorialUrl ? ((0, jsx_runtime_1.jsx)(components_1.Button, { href: tutorialUrl, style: buttonSecondary, children: "How Autofix works" })) : null] }), (0, jsx_runtime_1.jsx)(components_1.Hr, { style: hr }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: footer, children: "You are receiving this email because you joined the Autofix waitlist on Manifest." })] })] }) })] }));
}
const brandBg = '#faf9f6';
const brandCardBg = '#ffffff';
const brandBorder = '#e8e5df';
const brandFont = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const brandInk = '#1a1a1a';
const brandMuted = '#6b6b6b';
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
const badgeContainer = {
    marginBottom: '16px',
};
const newLine = {
    fontSize: '14px',
    margin: 0,
    lineHeight: '18px',
};
const newLabel = {
    color: brandInk,
    fontWeight: 600,
};
const autofixIcon = {
    display: 'inline-block',
    verticalAlign: 'middle',
    borderRadius: '4px',
    margin: '0 2px',
};
const autofixName = {
    color: brandInk,
    fontWeight: 700,
};
const heading = {
    fontSize: '22px',
    fontWeight: 700,
    color: brandInk,
    margin: '0 0 16px',
    lineHeight: '1.3',
};
const paragraph = {
    fontSize: '14px',
    lineHeight: '1.6',
    color: brandInk,
    margin: '0 0 16px',
};
const buttonSection = {
    textAlign: 'left',
    margin: '28px 0 20px',
};
const buttonBase = {
    fontSize: '14px',
    fontWeight: 600,
    borderRadius: '8px',
    padding: '12px 24px',
    textDecoration: 'none',
};
const buttonPrimary = {
    ...buttonBase,
    backgroundColor: brandInk,
    color: '#ffffff',
    marginRight: '12px',
};
const buttonSecondary = {
    ...buttonBase,
    backgroundColor: brandCardBg,
    color: brandInk,
    border: `1px solid ${brandBorder}`,
};
const hr = {
    borderColor: brandBorder,
    margin: '24px 0 16px',
};
const footer = {
    fontSize: '12px',
    color: brandMuted,
    margin: 0,
};
//# sourceMappingURL=doctor-release.js.map