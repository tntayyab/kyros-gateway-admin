"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeShortTermBedrockKey = makeShortTermBedrockKey;
function makeShortTermBedrockKey(region) {
    const payload = 'bedrock.amazonaws.com/?Action=CallWithBearerToken&' +
        `X-Amz-Credential=ASIAEXAMPLE%2F20260612%2F${region}%2Fbedrock%2Faws4_request`;
    return `bedrock-api-key-${Buffer.from(payload).toString('base64')}`;
}
//# sourceMappingURL=bedrock-fixtures.js.map