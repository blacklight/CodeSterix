// Initialize exports in case we include this file
// on client-side using require.js
var clientSide = false;
if (typeof window !== "undefined") {
    clientSide = true;
    var exports = {};
}

exports.httpHost = "localhost";
exports.httpPort = "80";
exports.httpProtocol = "http";
exports.httpURI = "CodeSterix";
exports.webSocketHost = "localhost";
exports.webSocketListenPort = "8080";

if (clientSide) {
    define("config", [], function() {
	   "use strict";
	   return exports;
    });
}

