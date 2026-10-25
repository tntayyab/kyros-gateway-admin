"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = exports.DEFAULT_KEYWORDS = void 0;
const keywords_1 = require("./keywords");
var keywords_2 = require("./keywords");
Object.defineProperty(exports, "DEFAULT_KEYWORDS", { enumerable: true, get: function () { return keywords_2.DEFAULT_KEYWORDS; } });
exports.DEFAULT_CONFIG = {
    dimensions: [
        { name: 'formalLogic', weight: 0.07, direction: 'up', keywords: keywords_1.DEFAULT_KEYWORDS.formalLogic },
        {
            name: 'analyticalReasoning',
            weight: 0.06,
            direction: 'up',
            keywords: keywords_1.DEFAULT_KEYWORDS.analyticalReasoning,
        },
        {
            name: 'codeGeneration',
            weight: 0.06,
            direction: 'up',
            keywords: keywords_1.DEFAULT_KEYWORDS.codeGeneration,
        },
        { name: 'codeReview', weight: 0.05, direction: 'up', keywords: keywords_1.DEFAULT_KEYWORDS.codeReview },
        {
            name: 'technicalTerms',
            weight: 0.07,
            direction: 'up',
            keywords: keywords_1.DEFAULT_KEYWORDS.technicalTerms,
        },
        {
            name: 'simpleIndicators',
            weight: 0.08,
            direction: 'down',
            keywords: keywords_1.DEFAULT_KEYWORDS.simpleIndicators,
        },
        { name: 'multiStep', weight: 0.07, direction: 'up', keywords: keywords_1.DEFAULT_KEYWORDS.multiStep },
        { name: 'creative', weight: 0.03, direction: 'up', keywords: keywords_1.DEFAULT_KEYWORDS.creative },
        {
            name: 'questionComplexity',
            weight: 0.03,
            direction: 'up',
            keywords: keywords_1.DEFAULT_KEYWORDS.questionComplexity,
        },
        {
            name: 'imperativeVerbs',
            weight: 0.02,
            direction: 'up',
            keywords: keywords_1.DEFAULT_KEYWORDS.imperativeVerbs,
        },
        {
            name: 'outputFormat',
            weight: 0.02,
            direction: 'up',
            keywords: keywords_1.DEFAULT_KEYWORDS.outputFormat,
        },
        {
            name: 'domainSpecificity',
            weight: 0.05,
            direction: 'up',
            keywords: keywords_1.DEFAULT_KEYWORDS.domainSpecificity,
        },
        {
            name: 'agenticTasks',
            weight: 0.03,
            direction: 'up',
            keywords: keywords_1.DEFAULT_KEYWORDS.agenticTasks,
        },
        { name: 'relay', weight: 0.02, direction: 'down', keywords: keywords_1.DEFAULT_KEYWORDS.relay },
        { name: 'webBrowsing', weight: 0, direction: 'up', keywords: keywords_1.DEFAULT_KEYWORDS.webBrowsing },
        { name: 'dataAnalysis', weight: 0, direction: 'up', keywords: keywords_1.DEFAULT_KEYWORDS.dataAnalysis },
        {
            name: 'imageGeneration',
            weight: 0,
            direction: 'up',
            keywords: keywords_1.DEFAULT_KEYWORDS.imageGeneration,
        },
        {
            name: 'videoGeneration',
            weight: 0,
            direction: 'up',
            keywords: keywords_1.DEFAULT_KEYWORDS.videoGeneration,
        },
        { name: 'socialMedia', weight: 0, direction: 'up', keywords: keywords_1.DEFAULT_KEYWORDS.socialMedia },
        {
            name: 'emailManagement',
            weight: 0,
            direction: 'up',
            keywords: keywords_1.DEFAULT_KEYWORDS.emailManagement,
        },
        {
            name: 'calendarManagement',
            weight: 0,
            direction: 'up',
            keywords: keywords_1.DEFAULT_KEYWORDS.calendarManagement,
        },
        { name: 'trading', weight: 0, direction: 'up', keywords: keywords_1.DEFAULT_KEYWORDS.trading },
        { name: 'tokenCount', weight: 0.05, direction: 'up' },
        { name: 'nestedListDepth', weight: 0.03, direction: 'up' },
        { name: 'conditionalLogic', weight: 0.03, direction: 'up' },
        { name: 'codeToProse', weight: 0.02, direction: 'up' },
        { name: 'constraintDensity', weight: 0.03, direction: 'up' },
        { name: 'expectedOutputLength', weight: 0.04, direction: 'up' },
        { name: 'repetitionRequests', weight: 0.02, direction: 'up' },
        { name: 'toolCount', weight: 0.04, direction: 'up' },
        { name: 'conversationDepth', weight: 0.03, direction: 'up' },
    ],
    boundaries: { simpleMax: -0.1, standardMax: 0.08, complexMax: 0.35 },
    confidenceK: 8,
    confidenceMidpoint: 0.15,
    confidenceThreshold: 0.45,
};
//# sourceMappingURL=config.js.map