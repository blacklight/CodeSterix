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
    "utils",
    "websocket_client",
    "protocol",
    "lib/handlebars",
    "lib/jquery.text-overflow",
], function($, Utils, WebSocketClient, Protocol, Handlebars) {
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

    var clear = function() {
	   currentPlaylist = [];
	   videosMap = {};
	   $("#playlist-container").html("");
    };

    var append = function(track, args) {
	   if (!window.config.room) {
		  alert("You are not connected to any room");
		  return;
	   }

	   track.added_at = Utils.sqlDateToPrettyDate(track.added_at);
	   currentPlaylist.push(track);
	   videosMap[track.youtube_id] = track;

	   var Player = require("player");
	   if (!Player.isInitialized()) {
		  Player.initialize(track.youtube_id, args);
	   }

	   if (!args || !args.appendToRoom) {
		  $(".empty-playlist").remove();
		  $("#playlist-container").append(playlistRowTemplate(track));
		  $(".playlist-item-name").textOverflow();
		  $(".playlist-item-description").textOverflow();
	   } else {
		  $.post("json/append_video_to_room.php", {
			 room_id     : window.config.room.id,
			 youtube_id  : track.youtube_id,
			 name        : track.name,
			 description : track.description,
			 image       : track.image,
		  })
		  .success(function(response) {
			 var track = response.track;
			 track.position = getNextItemPosition();
			 $(".empty-playlist").remove();
			 $("#playlist-container").append(playlistRowTemplate(track));
			 $(".playlist-item-name").textOverflow();
			 $(".playlist-item-description").textOverflow();

			 WebSocketClient.send({
				msgType : Protocol.MessageTypes.PLAYLIST_CHANGED,
				payload : {}
			 });
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
	   clear:  clear,
	   updateCurrentIndexByVideoId: updateCurrentIndexByVideoId,
	   getNextVideo: getNextVideo,
    };
});

