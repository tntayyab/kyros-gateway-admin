"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordingResponseFromText = recordingResponseFromText;
exports.createAttemptRecordingCapture = createAttemptRecordingCapture;
const inline_image_redaction_1 = require("./inline-image-redaction");
function recordingResponseFromText(raw) {
    try {
        return { type: 'json', body: JSON.parse(raw) };
    }
    catch {
        return { type: 'json', body: raw };
    }
}
function createAttemptRecordingCapture(requestBody, wireFormat) {
    let rawSse = '';
    let jsonBody;
    const buildResponseBody = () => {
        if (jsonBody !== undefined)
            return { type: 'json', body: jsonBody };
        if (rawSse)
            return { type: 'stream', raw_sse: rawSse };
        return null;
    };
    return {
        appendRaw(text) {
            rawSse += text;
        },
        setJson(body) {
            jsonBody = body;
            rawSse = '';
        },
        setRaw(text) {
            jsonBody = undefined;
            rawSse = text;
        },
        buildResponseBody,
        buildRecording() {
            return {
                version: 1,
                wire_format: wireFormat,
                request_body: (0, inline_image_redaction_1.redactInlineImageDataUrls)(requestBody),
                response_body: buildResponseBody(),
            };
        },
    };
}
//# sourceMappingURL=attempt-recording-capture.js.map