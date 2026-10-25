"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_KEYWORDS = void 0;
const complexity_1 = require("./keywords/complexity");
const web_browsing_1 = require("./keywords/web-browsing");
const data_analysis_1 = require("./keywords/data-analysis");
const image_generation_1 = require("./keywords/image-generation");
const video_generation_1 = require("./keywords/video-generation");
const social_media_1 = require("./keywords/social-media");
const email_management_1 = require("./keywords/email-management");
const calendar_management_1 = require("./keywords/calendar-management");
const trading_1 = require("./keywords/trading");
exports.DEFAULT_KEYWORDS = {
    ...complexity_1.COMPLEXITY_KEYWORDS,
    webBrowsing: web_browsing_1.WEB_BROWSING_KEYWORDS,
    dataAnalysis: data_analysis_1.DATA_ANALYSIS_KEYWORDS,
    imageGeneration: image_generation_1.IMAGE_GENERATION_KEYWORDS,
    videoGeneration: video_generation_1.VIDEO_GENERATION_KEYWORDS,
    socialMedia: social_media_1.SOCIAL_MEDIA_KEYWORDS,
    emailManagement: email_management_1.EMAIL_MANAGEMENT_KEYWORDS,
    calendarManagement: calendar_management_1.CALENDAR_MANAGEMENT_KEYWORDS,
    trading: trading_1.TRADING_KEYWORDS,
};
//# sourceMappingURL=keywords.js.map