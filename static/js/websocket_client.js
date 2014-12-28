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

	   switch (message.msgType) {
		  case Protocol.MessageTypes.HANDSHAKE_RESPONSE:
			 socketID = message.payload.socketID;
			 break;

		  case Protocol.MessageTypes.ROOM_SYNC:
			 if (!message.payload.currentStatus) {
				break;
			 }

			 if (message.payload.currentStatus.status === Protocol.VideoStatus.PLAY) {
				require("player").initialize(message.payload.currentStatus.youtubeID, {
				    seek: message.payload.currentStatus.seek
				});
			 }

			 break;

		  case Protocol.MessageTypes.USER_LIST_CHANGED:
			 if (message.payload && message.payload.roomID && message.payload.roomID != window.config.room.id) {
				break;
			 }

			 if (window.config.room) {
				require("room").updateRoom(window.config.room.id, { onlyUsersList: true });
			 }
			 break;

		  case Protocol.MessageTypes.PLAYLIST_CHANGED:
			 if (window.config.room) {
				require("room").updateRoom(window.config.room.id, { onlyPlayList: true });
			 }
			 break;

		  case Protocol.MessageTypes.VIDEO_PLAY:
			 if (message.payload && message.payload.youtubeID) {
				require("player").loadVideoById(message.payload.youtubeID);
			 } else {
				require("player").playVideo();
			 }
			 break;

		  case Protocol.MessageTypes.VIDEO_PAUSE:
			 require("player").pauseVideo();
			 break;

		  case Protocol.MessageTypes.VIDEO_SEEK:
			 require("player").seekTo(message.payload.seekTo);
			 break;

		  case Protocol.MessageTypes.HEARTBEAT_REQUEST:
			 send({
				msgType  : Protocol.MessageTypes.HEARTBEAT_RESPONSE,
				payload  : {
				    playerStatus : require("player").getCurrentStatus(),
				},
			 });
			 break;
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

