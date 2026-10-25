"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLoopbackIp = isLoopbackIp;
exports.getSocketRemoteAddress = getSocketRemoteAddress;
exports.isLoopbackPeer = isLoopbackPeer;
function isLoopbackIp(ip) {
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}
function getSocketRemoteAddress(request) {
    return request.socket?.remoteAddress ?? undefined;
}
function isLoopbackPeer(request) {
    const peer = getSocketRemoteAddress(request);
    return !!peer && isLoopbackIp(peer);
}
//# sourceMappingURL=local-ip.js.map