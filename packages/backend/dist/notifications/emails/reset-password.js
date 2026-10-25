"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordEmail = ResetPasswordEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const dashboard_url_1 = require("../../common/utils/dashboard-url");
const components_1 = require("@react-email/components");
function ResetPasswordEmail(props) {
    const { userName, resetUrl, logoUrl = (0, dashboard_url_1.getEmailAssetUrl)('manifest-logo.png') } = props;
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Head, {}), (0, jsx_runtime_1.jsx)(components_1.Preview, { children: "Reset your Manifest password" }), (0, jsx_runtime_1.jsx)(components_1.Body, { style: body, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { style: container, children: [(0, jsx_runtime_1.jsx)(components_1.Section, { style: logoSection, children: (0, jsx_runtime_1.jsx)(components_1.Img, { src: logoUrl, alt: "Manifest LLM Gateway", width: "174", height: "32", style: logoImg }) }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: card, children: [(0, jsx_runtime_1.jsx)(components_1.Text, { style: heading, children: "Reset your password" }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: paragraph, children: ["Hi ", userName, ", we received a request to reset your password. Click the button below to choose a new one."] }), (0, jsx_runtime_1.jsx)(components_1.Section, { style: buttonContainer, children: (0, jsx_runtime_1.jsx)(components_1.Button, { style: button, href: resetUrl, children: "Reset password" }) }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: hint, children: "This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email." })] }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: fallbackSection, children: [(0, jsx_runtime_1.jsx)(components_1.Text, { style: fallbackText, children: "If the button above doesn't work, copy and paste this link into your browser:" }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: fallbackUrl, children: resetUrl })] }), (0, jsx_runtime_1.jsx)(components_1.Hr, { style: divider }), (0, jsx_runtime_1.jsx)(components_1.Section, { style: footer, children: (0, jsx_runtime_1.jsxs)(components_1.Text, { style: footerMuted, children: ["\u00A9 2026 MNFST Inc. All rights reserved.", ' ', (0, jsx_runtime_1.jsx)(components_1.Link, { href: "https://manifest.build", style: footerLink, children: "manifest.build" })] }) })] }) })] }));
}
const brandBg = '#f8f6f1';
const brandCardBg = '#ffffff';
const brandPrimary = '#0f172a';
const brandPrimaryFg = '#f9f8f5';
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
const buttonContainer = {
    textAlign: 'center',
    margin: '0 0 28px',
};
const button = {
    backgroundColor: brandPrimary,
    color: brandPrimaryFg,
    fontSize: '14px',
    fontWeight: 600,
    padding: '14px 28px',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
    lineHeight: '1',
};
const hint = {
    fontSize: '13px',
    lineHeight: '1.5',
    color: brandMuted,
    margin: 0,
};
const fallbackSection = {
    padding: '24px 0 0',
};
const fallbackText = {
    fontSize: '12px',
    color: brandMuted,
    margin: '0 0 6px',
};
const fallbackUrl = {
    fontSize: '12px',
    color: brandMuted,
    margin: 0,
    wordBreak: 'break-all',
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
//# sourceMappingURL=reset-password.js.map