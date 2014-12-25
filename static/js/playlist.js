requirejs.config({
    baseUrl: 'static/js',
    shim: {
	   "lib/jquery.text-overflow": {
		  deps: ["jquery", "lib/jquery-ui"]
	   }
    }
});

define("playlist", [
    "jquery",
    "lib/handlebars",
    "lib/jquery.text-overflow",
], function($, Handlebars) {
    "use strict";

    var currentPlaylist = [];
    var videosMap = {};
    var currentPlaylistIndex = -1;
    var playlistRowTemplate = Handlebars.compile($("#playlist-row-template").html());

    var getNextItemPosition = function() {
	   var itemPosition = 0;
	   if ($("#playlist-container").find(".playlist-item-row").length) {
		  var $lastItem = $("#playlist-container").find(".playlist-item-row").last();
		  itemPosition = parseInt($lastItem.data("position")) + 1;
	   }

	   return itemPosition;
    };

    var append = function(track) {
	   track.position = getNextItemPosition();
	   currentPlaylist.push(track);
	   videosMap[track.id] = track;

	   $(".empty-playlist").remove();
	   $("#playlist-container").append(playlistRowTemplate(track));
	   $(".playlist-item-name").textOverflow();
	   $(".playlist-item-description").textOverflow();

	   var Player = require("player");
	   if (!Player.isInitialized()) {
		  Player.initialize(track.id);
	   }

	   if (window.config.room) {
		  $.post("json/append_video_to_room.php", {
			 room_id     : window.config.room.id,
			 youtube_id  : track.id,
			 name        : track.name,
			 description : track.description,
			 duration    : 300,  // TODO
			 image       : track.image,
		  });
	   }
    };

    var updateCurrentIndexByVideoId = function(videoID) {
	   if (videosMap[videoID]) {
		  currentPlaylistIndex = parseInt(videosMap[videoID].position);
	   }
    };

    var getNextVideo = function() {
	   return currentPlaylist[++currentPlaylistIndex];
    };

    return {
	   append: append,
	   updateCurrentIndexByVideoId: updateCurrentIndexByVideoId,
	   getNextVideo: getNextVideo,
    };
});

