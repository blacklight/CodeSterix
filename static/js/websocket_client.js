define("websocket_client", [
    "jquery",
    "lib/jquery.toaster",
    "protocol",
    "config",
    "utils",
], function($, Toaster, Protocol, Config, Utils) {
    "use strict";

    var webSocketHost = Config.webSocketHost,
	   webSocketPort = Config.webSocketListenPort,
	   socketID = undefined,
	   ws = undefined;

    var initialize = function(args) {
	   if (args) {
		  webSocketHost = args.webSocketHost || webSocketHost;
		  webSocketPort = args.webSocketPort || webSocketPort;
	   }

	   ws = new WebSocket("ws://" + webSocketHost + ":" + webSocketPort + "/");
	   ws.onopen = onOpen;
	   ws.onmessage = onMessage;
    };

    var onOpen = function(event) {
	   var sessionID = Utils.getCookie("PHPSESSID");

	   ws.send(JSON.stringify({
		  msgType : Protocol.MessageTypes.HANDSHAKE_REQUEST,
		  payload : {
			 sessionID : sessionID,
		  },
	   }));
    };

    var onMessage = function(event) {
	   var message = JSON.parse(event.data);
	   if (message.error && message.payload && message.payload.errorMessage) {
		  $.toaster({ priority: 'warning', title: 'WebSocket error', message: message.payload.errorMessage, settings: { timeout: 5000 } });
	   }

	   if (message.msgType === Protocol.MessageTypes.HANDSHAKE_RESPONSE && message.payload) {
		  socketID = message.payload.socketID;
	   } else if (message.msgType === Protocol.MessageTypes.USER_LIST_CHANGED && message.payload) {
		  if (window.config.room) {
			 require("room").updateRoom(window.config.room.id, { onlyUsersList: true });
		  }
	   } else if (message.msgType === Protocol.MessageTypes.HEARTBEAT_REQUEST) {
		  ws.send(JSON.stringify({
			 msgType  : Protocol.MessageTypes.HEARTBEAT_RESPONSE,
			 socketID : socketID,
		  }));
	   }
    };

    var send = function(message) {
	   message.socketID = socketID;
	   ws.send(JSON.stringify(message));
    };

    return {
	   initialize : initialize,
	   onOpen     : onOpen,
	   onMessage  : onMessage,
	   send       : send,
    };
});

