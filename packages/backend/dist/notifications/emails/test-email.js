"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestEmail = TestEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const dashboard_url_1 = require("../../common/utils/dashboard-url");
const components_1 = require("@react-email/components");
function TestEmail(props = {}) {
    const { logoUrl = (0, dashboard_url_1.getEmailAssetUrl)('manifest-logo.png') } = props;
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Head, {}), (0, jsx_runtime_1.jsx)(components_1.Preview, { children: "Your email configuration is working correctly" }), (0, jsx_runtime_1.jsx)(components_1.Body, { style: body, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { style: container, children: [(0, jsx_runtime_1.jsx)(components_1.Section, { style: logoSection, children: (0, jsx_runtime_1.jsx)(components_1.Img, { src: logoUrl, alt: "Manifest LLM Gateway", width: "174", height: "32", style: logoImg }) }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: card, children: [(0, jsx_runtime_1.jsx)(components_1.Section, { style: badgeContainer, children: (0, jsx_runtime_1.jsx)(components_1.Text, { style: successBadge, children: "Configuration verified" }) }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: heading, children: "Email is working" }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: paragraph, children: "This is a test email from Manifest. If you're reading this, your email provider configuration is working correctly." }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: paragraph, children: "Notification emails, like threshold alerts, will be delivered to this address." })] }), (0, jsx_runtime_1.jsx)(components_1.Hr, { style: divider }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: footer, children: [(0, jsx_runtime_1.jsx)(components_1.Text, { style: footerNote, children: "This is a one-time test email sent from Manifest." }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: footerMuted, children: ["\u00A9 2026 MNFST Inc. All rights reserved.", ' ', (0, jsx_runtime_1.jsx)(components_1.Link, { href: "https://manifest.build", style: footerLink, children: "manifest.build" })] })] })] }) })] }));
}
const brandBg = '#f8f6f1';
const brandCardBg = '#ffffff';
const brandFg = '#020817';
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
const badgeContainer = {
    marginBottom: '16px',
};
const successBadge = {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#16a34a',
    backgroundColor: '#f0fdf4',
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
    margin: '0 0 16px',
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
//# sourceMappingURL=test-email.js.map