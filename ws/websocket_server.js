(function() {
    "use strict";

    exports.WebSocketServer = function(args) {
	   var WebSocketServer = require('ws').Server,
		  log4js = require('log4js'),
		  logger = undefined,
		  $ = undefined,
		  XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest,
		  env = require('jsdom').env,
		  Config = require('./config.js'),
		  Protocol = require('./protocol.js');

	   env("<html></html>", function(errors, window) {
		  $ = require('jquery')(window);
		  $.support.cors = true;   // For cross-domain scripting in Node.js
		  $.ajaxSettings.xhr = function() {
			 return new XMLHttpRequest();
		  };
	   });

	   var self = this;
	   this.port = Config.webSocketListenPort;
	   this.clients = [];
	   this.clientsMap = {};
	   this.rooms = {};
	   this.roomVideos = {};
	   this.pendingHeartbeatTimeouts = {};
	   this.heartBeatInterval = Protocol.HeartBeatInterval;
	   this.heartBeatTimeout = Protocol.HeartBeatTimeout;

	   if (args) {
		  this.onConnect = args.onConnect || undefined;
		  this.onMessage = args.onMessage || undefined;
		  this.port = args.port || this.port;
		  this.heartBeatInterval = args.heartBeatInterval || this.heartBeatInterval;
		  this.heartBeatTimeout = args.heartBeatTimeout || this.heartBeatTimeout;
	   }

	   this.wss = new WebSocketServer({ port: this.port });
	   this.wss.on("connection", function(ws) {
		  onConnect(ws);
	   });

	   var initializeMsgHandlers = function(ws) {
		  ws.msgHandlers = {};
		  Object.keys(Protocol.MessageTypes).forEach(function(msgType) {
			 ws.msgHandlers[Protocol.MessageTypes[msgType]] = [];

			 switch (msgType) {
				case "HANDSHAKE_REQUEST":
				    ws.msgHandlers[Protocol.MessageTypes[msgType]].push(onHandshakeRequest);
				    break;
				case "HEARTBEAT_RESPONSE":
				    ws.msgHandlers[Protocol.MessageTypes[msgType]].push(onHeartBeatResponse);
				    break;
				case "ROOM_REGISTRATION":
				    ws.msgHandlers[Protocol.MessageTypes[msgType]].push(onRoomRegistration);
				    break;
				case "PLAYLIST_CHANGED":
				    ws.msgHandlers[Protocol.MessageTypes[msgType]].push(onPlaylistChanged);
				    break;
				case "VIDEO_PLAY":
				    ws.msgHandlers[Protocol.MessageTypes[msgType]].push(onVideoPlay);
				    break;
				case "VIDEO_PAUSE":
				    ws.msgHandlers[Protocol.MessageTypes[msgType]].push(onVideoPause);
				    break;
			 }
		  });
	   };

	   var initializeLogger = function() {
		  log4js.clearAppenders();
		  log4js.loadAppender("file");
		  log4js.addAppender(log4js.appenders.file("../log/ws.log"), "ws");
		  logger = log4js.getLogger("ws");
		  logger.setLevel("DEBUG");
		  logger.info("WebSocket server initialized");
	   };

	   var heartBeatLoop = function() {
		  for (var i=0; i < self.clients.length; ++i) {
			 if (self.clients[i].socketID) {
				self.pendingHeartbeatTimeouts[self.clients[i].socketID] = setTimeout(function(i) {
				    if (self.clients[i].socketID) {
					   logger.info(JSON.stringify({
						  socketID : self.clients[i].socketID,
						  messageType : Protocol.MessageTypes.HEARTBEAT_REQUEST,
						  result : "Request timed out",
					   }));

					   onClose(self.clients[i]);
				    }

				    self.clients.splice(i, 1);
				}, self.heartBeatTimeout, i);

				sendMessage(self.clients[i], {
				    msgType : Protocol.MessageTypes.HEARTBEAT_REQUEST,
				    payload : {},
				});
			 }
		  }
	   };

	   var onHeartBeatResponse = function(ws, message) {
		  if (ws.socketID && self.pendingHeartbeatTimeouts[ws.socketID]) {
			 clearTimeout(self.pendingHeartbeatTimeouts[ws.socketID]);
			 delete self.pendingHeartbeatTimeouts[ws.socketID];
		  }
	   };

	   var onClose = function(ws) {
		  logger.info(JSON.stringify({
			 remoteAddress : ws._socket ? ws._socket.remoteAddress : undefined,
			 remotePort : ws._socket ? ws._socket.remotePort : undefined,
			 socketID : ws.socketID || undefined,
			 messageType : Protocol.MessageTypes.CONNECTION_CLOSE,
		  }));

		  var roomID = ws.roomID;
		  if (ws.socketID) {
			 if (ws.roomID) {
				delete self.rooms[ws.roomID][ws.socketID];
			 }

			 delete self.clientsMap[ws.socketID];
			 ws.socketID = undefined;
		  }

		  if (ws.userID && ws.sessionID) {
			 $.getJSON(
					 Config.httpProtocol
				    + "://"
				    + Config.httpHost
				    + "/" + Config.httpURI
				    + "/json/user_disconnect.php", {
					   session_id : ws.sessionID,
				})
				.success(function() {
				    logger.info(JSON.stringify({
					   userID : ws.userID,
					   messageType : "User disconnect",
				    }));

				    if (roomID) {
					   notifyUserListChanged(roomID);
				    }
				})
				.error(function(jqxhr, state, error) {
				    logger.error(JSON.stringify({
					   sessionID : message.payload.sessionID,
					   event : "AJAX user_disconnect.php",
					   ajax : jqxhr,
					   state : state,
					   error: error,
				    }));
				})
				.always(function() {
				    ws.userID = undefined;
				    ws.sessionID = undefined;
				});
		  }
	   };

	   var onConnect = function(ws) {
		  initializeMsgHandlers(ws);

		  logger.debug(JSON.stringify({
			 remoteAddress : ws._socket.remoteAddress,
			 remotePort : ws._socket.remotePort,
			 messageType : "Connection request",
		  }));

		  ws.on("message", function(message) {
			 onMessage(ws, message);
		  });

		  ws.on("close", function() {
			 onClose(ws);
		  });

		  if (self.onConnect) {
			 self.onConnect(ws);
		  }
	   };

	   var onMessage = function(ws, message) {
		  message = JSON.parse(message);

		  if (message.msgType !== Protocol.MessageTypes.HEARTBEAT_RESPONSE) {
			 logger.debug(JSON.stringify({
				remoteAddress : ws._socket ? ws._socket.remoteAddress : undefined,
				remotePort : ws._socket ? ws._socket.remotePort : undefined,
				socketID : message.socketID || undefined,
				action : "Message IN",
				message : message,
			 }));
		  }

		  if (ws.msgHandlers[message.msgType]) {
			 ws.msgHandlers[message.msgType].forEach(function(msgHandler) {
				msgHandler(ws, message);
			 });
		  }

		  if (self.onMessage) {
			 self.onMessage(message);
		  }
	   };

	   var onHandshakeRequest = function(ws, message) {
		  if (!message.payload || !message.payload.sessionID) {
			 sendMessage(ws, {
				msgType : Protocol.MessageTypes.ERROR,
				error   : true,
				payload : {
				    errorMessage : "No sessionID specified in the payload",
				},
			 });

			 return;
		  }

		  $.getJSON(
				  Config.httpProtocol
				+ "://"
				+ Config.httpHost
				+ "/" + Config.httpURI
				+ "/json/get_session.php", { session_id : message.payload.sessionID })
			 .success(function(response) {
				if (response.session) {
				    ws.socketID = generateSocketID();
				    ws.userID = response.session.user_id;
				    ws.sessionID = response.session.session_id;
				    self.clients.push(ws);
				    self.clientsMap[ws.socketID] = ws;

				    logger.info(JSON.stringify({
					   remoteAddress : ws._socket.remoteAddress,
					   remotePort : ws._socket.remotePort,
					   sessionID : message.payload.sessionID,
					   messageType : "Client handshake succeeded",
					   response : response,
				    }));

				    sendMessage(ws, {
					   msgType : Protocol.MessageTypes.HANDSHAKE_RESPONSE,
					   payload : {
						  socketID : ws.socketID,
					   },
				    });
				} else {
				    sendMessage(ws, {
					   msgType : Protocol.MessageTypes.SESSION_ERROR,
					   error : true,
					   payload : {
						  errorMessage : "No such session",
					   },
				    });
				}
			 })
			 .error(function(jqxhr, state, error) {
				logger.error(JSON.stringify({
				    remoteAddress : ws._socket.remoteAddress,
				    remotePort : ws._socket.remotePort,
				    sessionID : message.payload.sessionID,
				    event : "AJAX get_session.php",
				    ajax : jqxhr,
				    state : state,
				    error: error,
				}));

				sendMessage(ws, {
				    msgType : Protocol.MessageTypes.HTTP_ERROR,
				    error : true,
				    payload : {
					   errorMessage : error,
				    },
				});
			 });
	   };

	   var onRoomRegistration = function(ws, message) {
		  if (!checkMessageIntegrity(ws, message)) {
			 return;
		  }

		  if (!message.payload || !message.payload.roomID) {
			 sendMessage(ws, {
				msgType : Protocol.MessageTypes.ERROR,
				error   : true,
				payload : {
				    errorMessage : "No roomID specified in the payload",
				},
			 });

			 return;
		  }

		  ws.roomID = message.payload.roomID;
		  if (!self.rooms[ws.roomID]) {
			 self.rooms[ws.roomID] = {};
		  }

		  self.rooms[ws.roomID][message.socketID] = ws;

		  logger.info(JSON.stringify({
			 socketID : message.socketID,
			 messageType : Protocol.MessageTypes.ROOM_REGISTRATION,
			 message : JSON.stringify({ roomID : ws.roomID }),
		  }));

		  notifyUserListChanged(ws.roomID);
	   };

	   var onPlaylistChanged = function(ws, message) {
		  if (!checkMessageIntegrity(ws, message)) {
			 return;
		  }

		  var roomID = self.clientsMap[message.socketID].roomID;
		  logger.info(JSON.stringify({
			 socketID : message.socketID,
			 messageType : Protocol.MessageTypes.PLAYLIST_CHANGED,
			 message : JSON.stringify({ roomID : ws.roomID }),
		  }));

		  notifyPlayListChanged(roomID);
	   };

	   var onVideoPlay = function(ws, message) {
		  if (!checkMessageIntegrity(ws, message)) {
			 return;
		  }

		  if (!message.payload || !message.payload.youtubeID) {
			 sendMessage(ws, {
				msgType : Protocol.MessageTypes.ERROR,
				error   : true,
				payload : {
				    errorMessage : "No youtubeID specified",
				},
			 });

			 return false;
		  }

		  var roomID = self.clientsMap[message.socketID].roomID;
		  if (self.roomVideos[roomID]
				&& self.roomVideos[roomID].youtubeID === message.payload.youtubeID) {
			 if (self.roomVideos[roomID].state === Protocol.VideoStatus.PLAY) {
				return;
			 }

			 logger.info(JSON.stringify({
				messageType : Protocol.MessageTypes.VIDEO_RESUME,
				socketID : ws.socketID,
				message : JSON.stringify({
				    roomID : roomID,
				    youtubeID : message.payload.youtubeID,
				}),
			 }));


			 self.roomVideos[roomID].state = Protocol.VideoStatus.PLAY;

			 Object.keys(self.rooms[roomID]).forEach(function(socketID) {
				var sock = self.rooms[roomID][socketID];
				if (sock.socketID === ws.socketID) {
				    return;
				}

				sendMessage(sock, {
				    msgType : Protocol.MessageTypes.VIDEO_PLAY,
				    payload : { },
				});
			 });

			 return;
		  }

		  $.getJSON(
			   Config.httpProtocol
			 + "://"
			 + Config.httpHost
			 + "/" + Config.httpURI
			 + "/json/change_playing_video.php", {
				room_id    : roomID,
				session_id : ws.sessionID,
				youtube_id : message.payload.youtubeID,
		  })
		  .success(function() {
			 logger.info(JSON.stringify({
				messageType : Protocol.MessageTypes.VIDEO_PLAY,
				socketID : ws.socketID,
				message : JSON.stringify({
				    roomID : roomID,
				    youtubeID : message.payload.youtubeID,
				}),
			 }));

			 var video = {
				youtubeID : message.payload.youtubeID,
				state     : Protocol.VideoStatus.PLAY,
				seek      : 0,
			 };

			 self.roomVideos[roomID] = video;

			 Object.keys(self.rooms[roomID]).forEach(function(socketID) {
				var sock = self.rooms[roomID][socketID];
				sendMessage(sock, {
				    msgType : Protocol.MessageTypes.VIDEO_PLAY,
				    payload : video,
				});
			 });
		  })
		  .error(function(jqxhr, state, error) {
			 logger.error(JSON.stringify({
				socketID : ws.socketID,
				event : "AJAX change_playing_video.php",
				ajax : jqxhr,
				state : state,
				error: error,
			 }));
		  });
	   };

	   var onVideoPause = function(ws, message) {
		  if (!checkMessageIntegrity(ws, message)) {
			 return;
		  }

		  var roomID = self.clientsMap[message.socketID].roomID;
		  if (self.roomVideos[roomID]
				&& self.roomVideos[roomID].state === Protocol.VideoStatus.PAUSE) {
			 return;
		  }

		  logger.info(JSON.stringify({
			 messageType : Protocol.MessageTypes.VIDEO_PAUSE,
			 socketID : ws.socketID,
			 message : JSON.stringify({
				roomID : roomID,
			 }),
		  }));

		  self.roomVideos[roomID].state = Protocol.VideoStatus.PAUSE;

		  Object.keys(self.rooms[roomID]).forEach(function(socketID) {
			 var sock = self.rooms[roomID][socketID];
			 sendMessage(sock, {
				msgType : Protocol.MessageTypes.VIDEO_PAUSE,
				payload : { },
			 });
		  });
	   };

	   var checkMessageIntegrity = function(ws, message) {
		  if (!message.socketID || !(message.socketID in self.clientsMap)) {
			 sendMessage(ws, {
				msgType : Protocol.MessageTypes.ERROR,
				error   : true,
				payload : {
				    errorMessage : "No socketID specified or socketID not registered",
				},
			 });

			 return false;
		  }

		  return true;
	   };

	   var sendMessage = function(ws, message) {
		  try {
			 if (message.msgType !== Protocol.MessageTypes.HEARTBEAT_REQUEST) {
				logger.debug(JSON.stringify({
				    remoteAddress : ws._socket.remoteAddress,
				    remotePort : ws._socket.remotePort,
				    socketID : ws.socketID || undefined,
				    action : "Message OUT",
				    message : message,
				}));
			 }

			 ws.send(JSON.stringify(message));
		  } catch (e) {
			 logger.warn(JSON.stringify({
				error   : e.toString(),
				message : message,
			 }));
		  }
	   };
	   
	   var generateSocketID = function() {
		  var validSocketID = false;
		  var socketID = undefined;

		  while (!validSocketID) {
			 socketID = Math.floor(Math.random() * Protocol.MaxSocketID);
			 if (!(socketID in self.clientsMap)) {
				validSocketID = true;
			 }
		  }

		  return socketID;
	   };

	   var notifyUserListChanged = function(roomID) {
		  Object.keys(self.rooms[roomID]).forEach(function(socketID) {
			 var sock = self.rooms[roomID][socketID];
			 sendMessage(sock, {
				msgType : Protocol.MessageTypes.USER_LIST_CHANGED,
				payload : {},
			 });
		  });
	   };

	   var notifyPlayListChanged = function(roomID) {
		  Object.keys(self.rooms[roomID]).forEach(function(socketID) {
			 var sock = self.rooms[roomID][socketID];
			 sendMessage(sock, {
				msgType : Protocol.MessageTypes.PLAYLIST_CHANGED,
				payload : {},
			 });
		  });
	   };

	   initializeLogger();
	   setInterval(heartBeatLoop, self.heartBeatInterval);
    };
}());

