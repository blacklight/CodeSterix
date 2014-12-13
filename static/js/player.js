define("player", [
    "jquery",
    "playlist",
    "lib/jquery.tube",
    "lib/bootstrap",
], function($, Playlist) {
    "use strict";

    var $video;
    var initialized = false;

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
		  }
	   });
    };

    var isInitialized = function() {
	   return initialized;
    };

    var loadVideoById = function(videoID) {
	   $video.p.loadVideoById(videoID);
	   Playlist.updateCurrentIndexByVideoId(videoID);
    };

    return {
	   initialize: initialize,
	   isInitialized: isInitialized,
	   loadVideoById: loadVideoById,
    };
});

