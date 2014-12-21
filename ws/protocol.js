// Initialize exports in case we include this file
// on client-side using require.js
var clientSide = false;
if (typeof window !== "undefined") {
    clientSide = true;
    var exports = {};
}

exports.MessageTypes = {
    HANDSHAKE_REQUEST  : "Handshake request",
    HANDSHAKE_RESPONSE : "Handshake response",
    HEARTBEAT_REQUEST  : "Heartbeat request",
    HEARTBEAT_RESPONSE : "Heartbeat response",
    HANDSHAKE_ERROR    : "Error",
    SESSION_ERROR      : "Session error",
    HTTP_ERROR         : "HTTP error",
};

exports.HeartBeatTimeout = 2000;
exports.HeartBeatInterval = 2000;
exports.MaxSocketID = Math.pow(2, 31);

if (clientSide) {
    define("protocol", [], function() {
	   "use strict";
	   return exports;
    });
}

