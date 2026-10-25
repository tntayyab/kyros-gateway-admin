"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isExcludedEmail = isExcludedEmail;
exports.domainOf = domainOf;
exports.isConsumerEmail = isConsumerEmail;
exports.isCorporateSignupEmail = isCorporateSignupEmail;
exports.isSignupCluster = isSignupCluster;
exports.isMachineGeneratedDomain = isMachineGeneratedDomain;
const INTERNAL_DOMAINS = ['manifest.build', 'buddyweb.fr', 'mnfstinc.com', 'mnfstinc.dev'];
const INTERNAL_EMAILS = ['sebastien.conejo@gmail.com'];
const JUNK_DOMAINS = [
    'slmail.me',
    'atomicmail.io',
    'paytrust.cc',
    'rapplo.com',
    'joystill.com',
    'abrdns.com',
    'cryptidcloud.org',
    'dralias.com',
    'mail.cfw.262019.xyz',
];
const ROLE_LOCAL_PARTS = [
    'info',
    'admin',
    'contact',
    'support',
    'sales',
    'marketing',
    'office',
    'team',
    'noreply',
    'no-reply',
    'test',
];
function isExcludedEmail(email) {
    const normalized = email.trim().toLowerCase();
    const at = normalized.lastIndexOf('@');
    if (at <= 0 || at === normalized.length - 1)
        return true;
    const local = normalized.slice(0, at);
    const domain = normalized.slice(at + 1);
    if (INTERNAL_EMAILS.includes(normalized))
        return true;
    if (matchesDomain(domain, INTERNAL_DOMAINS))
        return true;
    if (matchesDomain(domain, JUNK_DOMAINS))
        return true;
    return ROLE_LOCAL_PARTS.includes(local);
}
function matchesDomain(domain, list) {
    return list.some((entry) => domain === entry || domain.endsWith(`.${entry}`));
}
const CONSUMER_DOMAINS = [
    'gmail.com',
    'googlemail.com',
    'outlook.com',
    'outlook.fr',
    'hotmail.com',
    'hotmail.fr',
    'hotmail.co.uk',
    'live.com',
    'live.fr',
    'msn.com',
    'yahoo.com',
    'yahoo.co.uk',
    'yahoo.fr',
    'ymail.com',
    'aol.com',
    'icloud.com',
    'me.com',
    'mac.com',
    'proton.me',
    'protonmail.com',
    'pm.me',
    'duck.com',
    'simplelogin.com',
    'simplelogin.io',
    'anonaddy.com',
    'posteo.de',
    'gmx.com',
    'gmx.de',
    'gmx.net',
    'web.de',
    't-online.de',
    'free.fr',
    'orange.fr',
    'wanadoo.fr',
    'laposte.net',
    'sfr.fr',
    'comcast.net',
    'qq.com',
    '163.com',
    '126.com',
    'foxmail.com',
    'sina.com',
    'naver.com',
    'daum.net',
    'yandex.ru',
    'yandex.com',
    'mail.com',
    'mail.ru',
    'rambler.ru',
    'seznam.cz',
    'zoho.com',
    'fastmail.com',
    'hey.com',
    'engineer.com',
    'consultant.com',
    'usa.com',
    'europe.com',
    'bk.ru',
    'list.ru',
    'inbox.ru',
    'inbox.lv',
    'email.com',
    'email.cz',
    'example.com',
    'test.com',
];
const CONSUMER_FAMILIES = new RegExp('(?:^|\\.)(?:' +
    [
        'gmail',
        'googlemail',
        'yahoo',
        'ymail',
        'rocketmail',
        'outlook',
        'hotmail',
        'live',
        'msn',
        'aol',
        'icloud',
        'proton',
        'protonmail',
        'tuta',
        'tutanota',
        'tutamail',
        'gmx',
        'yandex',
        'rambler',
        'disroot',
        'posteo',
        'mailbox',
        'riseup',
        'zoho',
        'fastmail',
        'qq',
        'foxmail',
        'naver',
        'daum',
        'seznam',
        'laposte',
        'wanadoo',
    ].join('|') +
    ')\\.[a-z]{2,3}(?:\\.[a-z]{2})?$');
const RELAY_AND_DISPOSABLE_DOMAINS = [
    'privaterelay.appleid.com',
    'passinbox.com',
    'passmail.net',
    'passmail.com',
    'passfwd.com',
    'mozmail.com',
    'relay.firefox.com',
    'addy.io',
    'anonaddy.me',
    'simplelogin.co',
    'simplelogin.fr',
    'startmail.com',
    'sharklasers.com',
    'guerrillamail.com',
    'guerrillamail.info',
    'grr.la',
    'yopmail.com',
    'harakirimail.com',
    'tempmail10.com',
    'mailinator.com',
    'agentmail.to',
    'maildrop.cc',
    'getnada.com',
    'dispostable.com',
    'trashmail.com',
    '10minutemail.com',
];
const ACADEMIC_DOMAIN = /(?:^|\.)(?:edu|ac)\.[a-z]{2}$|\.edu$/;
const CLUSTER_WINDOW_MS = 30 * 86_400_000;
const CLUSTER_MIN_SIGNUPS = 3;
function domainOf(email) {
    const normalized = email.trim().toLowerCase();
    const at = normalized.lastIndexOf('@');
    if (at <= 0 || at === normalized.length - 1)
        return '';
    return normalized.slice(at + 1);
}
function isConsumerEmail(email) {
    const domain = domainOf(email);
    if (!domain)
        return true;
    return (matchesDomain(domain, CONSUMER_DOMAINS) ||
        matchesDomain(domain, RELAY_AND_DISPOSABLE_DOMAINS) ||
        CONSUMER_FAMILIES.test(domain) ||
        ACADEMIC_DOMAIN.test(domain));
}
function isCorporateSignupEmail(email) {
    return !isExcludedEmail(email) && !isConsumerEmail(email);
}
function isSignupCluster(signups) {
    if (signups.length < CLUSTER_MIN_SIGNUPS)
        return false;
    if (signups.some((signup) => signup.has_traffic))
        return false;
    const times = signups
        .map((signup) => new Date(signup.signed_up_at).getTime())
        .sort((a, b) => a - b);
    return times[times.length - 1] - times[0] <= CLUSTER_WINDOW_MS;
}
const MACHINE_LOCAL_PART = /^[a-z]{4,8}[0-9]{3,6}$/;
function isMachineGeneratedDomain(localParts) {
    return localParts.length >= 2 && localParts.every((local) => MACHINE_LOCAL_PART.test(local));
}
//# sourceMappingURL=crm-metrics.filters.js.map