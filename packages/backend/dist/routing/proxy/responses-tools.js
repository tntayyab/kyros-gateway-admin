"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responsesToolNames = responsesToolNames;
exports.chatToolName = chatToolName;
exports.chatTools = chatTools;
const crypto_1 = require("crypto");
function isRecord(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}
function alias(namespace, name, salt = 0) {
    const prefix = `${namespace}__${name}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const hash = (0, crypto_1.createHash)('sha256')
        .update(JSON.stringify([namespace, name, salt]))
        .digest('hex');
    return `${prefix}_${hash.slice(0, 24)}`;
}
function responsesToolNames(tools) {
    const names = new Map();
    if (!Array.isArray(tools))
        return names;
    const reserved = new Set(tools
        .filter(isRecord)
        .filter((tool) => tool.type === 'function')
        .map((tool) => tool.name));
    for (const tool of tools) {
        if (!isRecord(tool) || tool.type !== 'namespace' || typeof tool.name !== 'string')
            continue;
        if (!Array.isArray(tool.tools))
            continue;
        for (const fn of tool.tools) {
            if (!isRecord(fn) || fn.type !== 'function' || typeof fn.name !== 'string')
                continue;
            let name = alias(tool.name, fn.name);
            let salt = 0;
            while (reserved.has(name))
                name = alias(tool.name, fn.name, ++salt);
            names.set(name, { name: fn.name, namespace: tool.name });
        }
    }
    for (const tool of tools) {
        if (isRecord(tool) && tool.type === 'function' && typeof tool.name === 'string') {
            names.set(tool.name, { name: tool.name });
        }
    }
    return names;
}
function chatToolName(item, names) {
    const name = typeof item.name === 'string' ? item.name : 'unknown';
    if (typeof item.namespace !== 'string' || !item.namespace)
        return name;
    for (const [wireName, original] of names) {
        if (original.name === name && original.namespace === item.namespace)
            return wireName;
    }
    return alias(item.namespace, name);
}
function chatTools(tools, names) {
    return tools.filter(isRecord).flatMap((tool) => {
        if (tool.type === 'namespace' && Array.isArray(tool.tools)) {
            return chatTools(tool.tools.filter(isRecord).map((fn) => ({ ...fn, namespace: tool.name })), names);
        }
        if (tool.type !== 'function')
            return [];
        return [
            {
                type: 'function',
                function: {
                    name: chatToolName(tool, names),
                    ...(tool.description !== undefined && { description: tool.description }),
                    ...(tool.parameters !== undefined && { parameters: tool.parameters }),
                    ...(tool.strict !== undefined && { strict: tool.strict }),
                },
            },
        ];
    });
}
//# sourceMappingURL=responses-tools.js.map