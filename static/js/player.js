define("player", [
    "jquery",
    "playlist",
    "websocket_client",
    "protocol",
    "lib/jquery.tube",
    "lib/bootstrap",
], function($, Playlist, WebSocketClient, Protocol) {
    "use strict";

    var $video,
	   pendingVideoAction,
	   initialized = false;

    var initialize = function(videoID, opts) {
	   initialized = true;
	   var self = this;

	   $("#player-no-video").addClass("hidden");
	   $("#player-loading-video").removeClass("hidden");
	   $("#player").player({
		  width: "100%",
		  video: videoID,

		  events: {
			 ready: function() {
				$video = $("#player-tube").data("player");
				$("#player-loading-video").addClass("hidden");

				if (!pendingVideoAction) {
				    if (!opts || (opts && !opts.onlyAppend)) {
					   if (opts && opts.seek && opts.sampledAt && !opts.paused) {
						  opts.seek += (new Date().getTime() - opts.sampledAt)/1000;
					   }

					   self.loadVideoById(videoID, opts);
				    }
				} else {
				    if (pendingVideoAction.seek) {
					   var seek = pendingVideoAction.seek + (pendingVideoAction.sampledAt
						  ? (new Date().getTime() - pendingVideoAction.sampledAt)/1000
						  : 0);

					   seekTo(seek);
				    }

				    if (pendingVideoAction.paused) {
					   pauseVideo();
				    }
				}
			 },

			 end: function(event) {
				var nextVideo = Playlist.getNextVideo();
				if (nextVideo) {
				    self.loadVideoById(nextVideo.youtube_id);
				}
			 },

			 play: function(event) {
				var videoData = $video.p.getVideoData();
				WebSocketClient.send({
				    msgType : Protocol.MessageTypes.VIDEO_PLAY,
				    payload : {
					   youtubeID : videoData.video_id
				    }
				});

				var seek = $video.p.getCurrentTime();
				if (seek) {
				    WebSocketClient.send({
					   msgType : Protocol.MessageTypes.VIDEO_SEEK,
					   payload : {
						  seek: seek
					   }
				    });
				}
			 },

			 unstarted: function(event) {
			 },

			 pause: function(event) {
				WebSocketClient.send({
				    msgType : Protocol.MessageTypes.VIDEO_PAUSE,
				    payload : { }
				});
			 },

			 cue: function(event) {
			 },

			 buffer: function(event) {
			 },
		  }
	   });
    };

    var isInitialized = function() {
	   return initialized;
    };

    var pauseVideo = function() {
	   $video.p.pauseVideo();
    };

    var playVideo = function() {
	   $video.p.playVideo();
    };

    var seekTo = function(seek) {
	   $video.p.seekTo(seek);
    };

    var loadVideoById = function(videoID, opts) {
	   if (!$video || !$video.p || !$video.p.loadVideoById) {
		  this.initialize(videoID, opts);
		  return;
	   }

	   $video.p.loadVideoById(videoID);
	   Playlist.updateCurrentIndexByVideoId(videoID);

	   if (opts && opts.whenReady) {
		  pendingVideoAction = {};
	   }

	   if (opts && opts.seek) {
		  if (opts.whenReady) {
			 pendingVideoAction.seek = opts.seek;
		  } else {
			 seekTo(opts.seek);
		  }
	   }

	   if (opts && opts.paused) {
		  if (opts.whenReady) {
			 pendingVideoAction.paused = true;
		  } else {
			 pauseVideo();
		  }
	   }

	   if (pendingVideoAction && opts && opts.sampledAt) {
		  pendingVideoAction.sampledAt = opts.sampledAt;
	   }
    };

    var getCurrentStatus = function() {
	   if (!$video || !$video.p) {
		  return undefined;
	   }

	   var videoData = $video.p.getVideoData();
	   if (!videoData) {
		  return undefined;
	   }

	   var currentTime = $video.p.getCurrentTime();
	   var playerState = $video.p.getPlayerState();
	   switch (playerState) {
		  case -1:
			 playerState = Protocol.VideoStatus.UNSTARTED;
			 break;
		  case 0:
			 playerState = Protocol.VideoStatus.END;
			 break;
		  case 1:
			 playerState = Protocol.VideoStatus.PLAY;
			 break;
		  case 2:
			 playerState = Protocol.VideoStatus.PAUSE;
			 break;
		  case 3:
			 playerState = Protocol.VideoStatus.BUFFER;
			 break;
		  case 5:
			 playerState = Protocol.VideoStatus.CUE;
			 break;
	   }

	   return {
		  youtubeID : videoData.video_id,
		  time      : currentTime,
		  status    : playerState,
		  sampledAt : new Date().getTime(),
	   };
    };

    var reset = function() {
	   if ($("iframe#player").length > 0) {
		  $("iframe#player").remove();
		  $(".main-panel-left").append('<div id="player"></div>');
		  $("#player-no-video").removeClass("hidden");
	   }

	   $video = undefined;
	   initialized = false;
    };

    return {
	   getCurrentStatus: getCurrentStatus,
	   initialize: initialize,
	   isInitialized: isInitialized,
	   loadVideoById: loadVideoById,
	   pauseVideo: pauseVideo,
	   playVideo: playVideo,
	   reset: reset,
	   seekTo: seekTo,
    };
});

