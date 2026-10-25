"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACTIVATION_THRESHOLDS = exports.KEYWORD_WEIGHTS = void 0;
exports.weightFor = weightFor;
exports.KEYWORD_WEIGHTS = {
    'navigate to': 4,
    'browse to': 4,
    scrape: 4,
    crawl: 4,
    'open url': 4,
    'fetch url': 4,
    'fetch the url': 4,
    'take a screenshot': 4,
    'web search': 4,
    'bookmark this': 4,
    'fill out the form': 4,
    browse: 3,
    visit: 3,
    navigate: 3,
    'go to': 3,
    'open this': 3,
    'search for': 3,
    'search on': 3,
    'fill out': 3,
    'look up': 3,
    'scroll to': 3,
    'scroll down': 3,
    'scroll up': 3,
    'this website': 3,
    'this webpage': 3,
    'this site': 3,
    'this url': 3,
    'on this page': 3,
    'on this site': 3,
    'on this website': 3,
    'from this page': 3,
    'this page': 3,
    'this domain': 2,
    'open the url': 2,
    'click the': 2,
    'click on': 2,
    'click on the': 2,
    'screenshot of': 2,
    webpage: 2,
    website: 1.5,
    'web page': 1.5,
};
exports.ACTIVATION_THRESHOLDS = {
    coding: 1.0,
    web_browsing: 3.0,
    data_analysis: 1.0,
    image_generation: 1.0,
    video_generation: 1.0,
    social_media: 1.0,
    email_management: 1.0,
    calendar_management: 1.0,
    trading: 1.0,
};
function weightFor(keyword) {
    return exports.KEYWORD_WEIGHTS[keyword] ?? 1;
}
//# sourceMappingURL=specificity-weights.js.map