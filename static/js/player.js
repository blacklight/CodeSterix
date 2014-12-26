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
	   initialized = false;

    var initialize = function(videoID) {
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
				self.loadVideoById(videoID);
			 },

			 end: function(event) {
				var nextVideo = Playlist.getNextVideo();
				if (nextVideo) {
				    self.loadVideoById(nextVideo.id);
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

    var loadVideoById = function(videoID) {
	   $video.p.loadVideoById(videoID);
	   Playlist.updateCurrentIndexByVideoId(videoID);
    };

    return {
	   initialize: initialize,
	   isInitialized: isInitialized,
	   loadVideoById: loadVideoById,
	   pauseVideo: pauseVideo,
	   playVideo: playVideo,
    };
});

