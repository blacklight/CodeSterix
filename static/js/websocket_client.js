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
	   var Room, Player, Playlist, EventWindow;

	   if (message.error && message.payload && message.payload.errorMessage) {
		  $.toaster({ priority: 'warning', title: 'WebSocket error', message: message.payload.errorMessage, settings: { timeout: 5000 } });
	   }

	   switch (message.msgType) {
		  case Protocol.MessageTypes.HANDSHAKE_RESPONSE:
			 socketID = message.payload.socketID;
			 if (!Room) {
				Room = require("room");
			 }

			 Room.initRoom();
			 break;

		  case Protocol.MessageTypes.ROOM_SYNC:
			 if (!Room) {
				Room = require("room");
			 }

			 var curStatus = message.payload.currentStatus;
			 Room.onRoomSync(curStatus.roomID);

			 if (curStatus.youtubeID) {
				if (!Player) {
				    Player = require("player");
				}

				Player.loadVideoById(curStatus.youtubeID, {
				    seek      : curStatus.seek,
				    paused    : curStatus.status !== Protocol.VideoStatus.PLAY,
				    sampledAt : curStatus.sampledAt,
				});
			 }

			 break;

		  case Protocol.MessageTypes.USER_LIST_CHANGED:
			 if (message.payload
				    && message.payload.roomID
				    && window.config.room
				    && message.payload.roomID != window.config.room.id) {
				break;
			 }

			 if (message.payload.user) {
				if (!EventWindow) {
				    EventWindow = require("event_window");
				}

				EventWindow.addEvent({
				    type: message.payload.connected
					   ? Protocol.Events.USER_CONNECT : Protocol.Events.USER_DISCONNECT,
				    username: message.payload.user.name,
				});
			 }

			 if (window.config.room) {
				require("room").updateRoom(window.config.room.id);
			 }

			 break;

		  case Protocol.MessageTypes.PLAYLIST_CHANGED:
			 if (window.config.room) {
				require("room").updateRoom(window.config.room.id);
			 }

			 break;

		  case Protocol.MessageTypes.VIDEO_PLAY:
			 if (message.payload && message.payload.youtubeID) {
				require("player").loadVideoById(message.payload.youtubeID);
			 } else {
				require("player").playVideo({ seek: message.payload && message.payload.seek
				    ? message.payload.seek : undefined });
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

		  case Protocol.MessageTypes.CHAT_MSG:
			 if (!message.payload || !message.payload.user
				|| !(message.payload.roomID || message.payload.userID)
				|| (message.payload.roomID
				    && window.config.room
				    && message.payload.roomID != window.config.room.id)
				|| (message.payload.userID
				    && message.payload.userID != window.config.user.id))
			 {
				break;
			 }

			 if (!EventWindow) {
				EventWindow = require("event_window");
			 }

			 if (message.payload.roomID) {
				EventWindow.addEvent({
				    type     : Protocol.Events.ROOM_MSG,
				    user     : message.payload.user,
				    message  : message.payload.message,
				});
			 } else if (message.payload.userID) {
				// TODO
			 }

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

