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

			 if (!ws.roomID) {
				return;
			 }

			 var currentStatus;
			 if (ws.playerStatus) {
				currentStatus = ws.playerStatus;
			 }

			 if (message.payload && message.payload.playerStatus) {
				var newStatus = message.payload.playerStatus;
				if (currentStatus) {
				    // Workaround for capturing seek events. Since YouTube IFrame API
				    // doesn't provide listeners on seek events, we poll the clients
				    // on heartbeat messages and try to find out unexpected
				    // currentTime differences
				    if (currentStatus.youtubeID === newStatus.youtubeID
						  && newStatus.status === Protocol.VideoStatus.PLAY
						  && Math.abs(currentStatus.time - newStatus.time)
							 - (Protocol.HeartBeatInterval/1000) > 1) {
					   logger.info(JSON.stringify({
						  socketID      : ws.socketID,
						  messageType   : Protocol.MessageTypes.VIDEO_SEEK,
						  message       : {
							 roomID    : ws.roomID,
							 youtubeID : newStatus.youtubeID,
							 seekTo    : newStatus.time,
						  },
					   }));

					   Object.keys(self.rooms[ws.roomID]).forEach(function(socketID) {
						  var sock = self.rooms[ws.roomID][socketID];
						  sock.seekPerformed = true;
						  sendMessage(sock, {
							 msgType    : Protocol.MessageTypes.VIDEO_SEEK,
							 payload    : {
								seekTo : newStatus.time,
							 },
						  });
					   });

					   ws.playerStatus = newStatus;
					   return;
				    }
				}

				ws.playerStatus = newStatus;

				// If there was no seek backward/forward since last heartbeat,
				// wait for all the clients in the room to reply to this round
				// of heartbeat messages with their current playing time statistics
				var allRoomHeartbeatsReceived = true;
				var allWatchingSameItem = true;
				var allPlayersActive = true;
				var seekPreviouslyPerformed = false;
				var minSeekTime = 9999999;
				var maxSeekTime = 0;
				var minSeekTimeSampledAt = undefined;
				var maxSeekTimeSampledAt = undefined;

				Object.keys(self.rooms[ws.roomID]).forEach(function(socketID) {
				    var sock = self.rooms[ws.roomID][socketID];
				    if (self.pendingHeartbeatTimeouts[sock.socketID]) {
					   allRoomHeartbeatsReceived = false;
					   return;
				    }

				    if (!sock.playerStatus) {
					   allWatchingSameItem = false;
					   return;
				    }

				    if (sock.playerStatus.youtubeID !== newStatus.youtubeID) {
					   allWatchingSameItem = false;
					   return;
				    }

				    if (sock.playerStatus.status !== Protocol.VideoStatus.PLAY) {
					   allPlayersActive = false;
					   return;
				    }

				    if (sock.seekPerformed) {
					   sock.seekPerformed = false;
					   seekPreviouslyPerformed = true;
					   return;
				    }

				    if (sock.playerStatus.time < minSeekTime) {
					   minSeekTime = parseFloat(sock.playerStatus.time);
					   minSeekTimeSampledAt = sock.playerStatus.sampledAt;
				    }

				    if (sock.playerStatus.time > maxSeekTime) {
					   maxSeekTime = parseFloat(sock.playerStatus.time);
					   maxSeekTimeSampledAt = sock.playerStatus.sampledAt;
				    }
				});

				if (allRoomHeartbeatsReceived && allWatchingSameItem && allPlayersActive) {
				    var seekCorrectionTolerance = 1;
				    var smallCorrectionThreshold = 5;

				    self.roomVideos[ws.roomID] = {
					   youtubeID : message.payload.playerStatus.youtubeID,
					   status    : ws.playerStatus.status,
					   sampledAt : new Date().getTime(),
					   seek      : maxSeekTime,
					   roomID    : ws.roomID,
				    };

				    logger.debug(JSON.stringify({
					   messageType :  Protocol.MessageTypes.ROOM_INFO_UPDATE,
					   message     :  {
						  room    : self.roomVideos[ws.roomID]
					   }
				    }));

				    // If the time offset among the players in the room
				    // is above a certain tolerance, but not big enough
				    // to justify the players ahead to be paused and wait,
				    // apply a seek correction using the average seek time
				    if (maxSeekTime - minSeekTime > seekCorrectionTolerance
						  && maxSeekTime - minSeekTime <= smallCorrectionThreshold
						  && !seekPreviouslyPerformed) {
					   var seekTo = maxSeekTime + (new Date().getTime() - maxSeekTimeSampledAt)/1000;
					   logger.info(JSON.stringify({
						  messageType   : Protocol.MessageTypes.SEEK_CORRECTION,
						  message       : {
							 roomID    : ws.roomID,
							 youtubeID : newStatus.youtubeID,
							 seekTo    : seekTo,
						  },
					   }));

					   Object.keys(self.rooms[ws.roomID]).forEach(function(socketID) {
						  var sock = self.rooms[ws.roomID][socketID];
						  sendMessage(sock, {
							 msgType    : Protocol.MessageTypes.VIDEO_SEEK,
							 payload    : {
								seekTo : seekTo,
							 },
						  });
					   });
				    }
				}
			 }
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
					   remoteAddress : ws._socket ? ws._socket.remoteAddress : undefined,
					   remotePort : ws._socket ? ws._socket.remotePort : undefined,
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
				    remoteAddress : ws._socket ? ws._socket.remoteAddress : undefined,
				    remotePort : ws._socket ? ws._socket.remotePort : undefined,
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

		  var oldRoomID = undefined;
		  if (ws.roomID) {
			 oldRoomID = ws.roomID;
		  }

		  if (ws.roomID && self.rooms[ws.roomID]
				&& ws.socketID && self.rooms[ws.roomID][ws.socketID]) {
			 delete self.rooms[ws.roomID][ws.socketID];
		  }

		  ws.roomID = message.payload.roomID;
		  if (!self.rooms[ws.roomID]) {
			 self.rooms[ws.roomID] = {};
		  }

		  self.rooms[ws.roomID][message.socketID] = ws;

		  logger.info(JSON.stringify({
			 socketID : message.socketID,
			 messageType : Protocol.MessageTypes.ROOM_REGISTRATION,
			 message : { roomID : ws.roomID },
		  }));

		  var currentStatus = {
			 roomID: ws.roomID
		  };

		  if (self.roomVideos[ws.roomID]) {
			 currentStatus.youtubeID = self.roomVideos[ws.roomID].youtubeID;
			 currentStatus.status = self.roomVideos[ws.roomID].status;
			 currentStatus.sampledAt = self.roomVideos[ws.roomID].sampledAt;
			 currentStatus.seek = parseFloat(self.roomVideos[ws.roomID].seek)
				+ parseFloat(new Date().getTime() - parseInt(self.roomVideos[ws.roomID].sampledAt))/1000;
		  }

		  sendMessage(ws, {
			 msgType : Protocol.MessageTypes.ROOM_SYNC,
			 payload : {
				currentStatus: currentStatus
			 },
		  });

		  notifyUserListChanged(ws.roomID);
		  if (oldRoomID) {
			 notifyUserListChanged(oldRoomID);
		  }
	   };

	   var onPlaylistChanged = function(ws, message) {
		  if (!checkMessageIntegrity(ws, message)) {
			 return;
		  }

		  var roomID = self.clientsMap[message.socketID].roomID;
		  logger.info(JSON.stringify({
			 socketID : message.socketID,
			 messageType : Protocol.MessageTypes.PLAYLIST_CHANGED,
			 message : { roomID : ws.roomID },
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
			 if (self.roomVideos[roomID].status === Protocol.VideoStatus.PLAY) {
				return;
			 }

			 logger.info(JSON.stringify({
				messageType : Protocol.MessageTypes.VIDEO_RESUME,
				socketID    : ws.socketID,
				message     : {
				    roomID    : roomID,
				    youtubeID : message.payload.youtubeID,
				    seek      : ws.playerStatus ? ws.playerStatus.time : undefined,
				},
			 }));


			 self.roomVideos[roomID].status = Protocol.VideoStatus.PLAY;
			 self.roomVideos[roomID].sampledAt = new Date().getTime();

			 Object.keys(self.rooms[roomID]).forEach(function(socketID) {
				var sock = self.rooms[roomID][socketID];
				if (sock.socketID === ws.socketID) {
				    return;
				}

				sendMessage(sock, {
				    msgType  : Protocol.MessageTypes.VIDEO_PLAY,
				    payload  : {
					   seek : ws.playerStatus ? ws.playerStatus.time : undefined,
				    },
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
				message : {
				    roomID : roomID,
				    youtubeID : message.payload.youtubeID,
				},
			 }));

			 var video = {
				youtubeID : message.payload.youtubeID,
				status    : Protocol.VideoStatus.PLAY,
				seek      : 0,
				sampledAt : new Date().getTime(),
			 };

			 self.roomVideos[roomID] = video;

			 Object.keys(self.rooms[roomID]).forEach(function(socketID) {
				var sock = self.rooms[roomID][socketID];
				if (sock.socketID === ws.socketID) {
				    return;
				}

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
				&& self.roomVideos[roomID].status === Protocol.VideoStatus.PAUSE) {
			 return;
		  }

		  logger.info(JSON.stringify({
			 messageType : Protocol.MessageTypes.VIDEO_PAUSE,
			 socketID : ws.socketID,
			 message : {
				roomID : roomID,
			 },
		  }));

		  self.roomVideos[roomID].status = Protocol.VideoStatus.PAUSE;

		  Object.keys(self.rooms[roomID]).forEach(function(socketID) {
			 var sock = self.rooms[roomID][socketID];
			 if (sock.socketID === ws.socketID) {
				return;
			 }

			 sendMessage(sock, {
				msgType : Protocol.MessageTypes.VIDEO_PAUSE,
				payload : { },
			 });
		  });
	   };

	   var onVideoSeek = function(ws, message) {
		  if (!checkMessageIntegrity(ws, message)) {
			 return;
		  }

		  if (!message.payload || !message.payload.seek) {
			 return;
		  }

		  var roomID = self.clientsMap[message.socketID].roomID;
		  var seek = message.payload.seek;

		  logger.info(JSON.stringify({
			 messageType : Protocol.MessageTypes.VIDEO_SEEK,
			 socketID : ws.socketID,
			 message : {
				seek : seek,
			 },
		  }));

		  Object.keys(self.rooms[roomID]).forEach(function(socketID) {
			 var sock = self.rooms[roomID][socketID];
			 if (sock.socketID === ws.socketID) {
				return;
			 }

			 sendMessage(sock, {
				msgType : Protocol.MessageTypes.VIDEO_PAUSE,
				payload : {
				    seekTo: seek
				},
			 });
		  });
	   };

	   var checkMessageIntegrity = function(ws, message) {
		  if (!message.socketID || !(message.socketID in self.clientsMap)) {
			 sendMessage(ws, {
				msgType : Protocol.MessageTypes.ERROR,
				error   : true,
				payload : {
				    reconnect : true,
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
				    remoteAddress : ws._socket ? ws._socket.remoteAddress : undefined,
				    remotePort : ws._socket ? ws._socket.remotePort : undefined,
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
				payload : { roomID : roomID },
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

