requirejs.config({
    baseUrl: 'static/js',
    shim: {
	   "lib/jquery.ui.autocomplete.html": {
		  deps: ["jquery", "lib/jquery-ui"]
	   }
    }
});

define([
    "jquery",
    "utils",
    "lib/handlebars",
    "player",
    "playlist",
    "search",
    "room",
    "websocket_client",
    "lib/bootstrap",
    "lib/jquery.ui.autocomplete.html",
], function($, Utils, Handlebars, Player, Playlist, Search, Room, WebSocketClient) {
    "use strict";

    var args = {},
	   headerTemplate,
	   webSocketClient,
	   emptyPlaylistTemplate,
	   playerLoadingTemplate;

    var init = function() {
	   initTemplates();
	   initElements();
	   initBindings();
	   initWebSocketClient();
	   Room.initRoom();
    };

    var initTemplates = function() {
	   headerTemplate = Handlebars.compile($("#header-template").html());
	   emptyPlaylistTemplate = Handlebars.compile($("#empty-playlist-template").html());
	   playerLoadingTemplate = Handlebars.compile($("#player-loading-template").html());
    };

    var initElements = function() {
	   args = Utils.getUrlArguments();
	   $("#header").html(headerTemplate(window.config.user));
	   $("#playlist-container").html(emptyPlaylistTemplate);
	   $("#player-loading-video").html(playerLoadingTemplate);
	   Room.initRoomsModal();
    };

    var initBindings = function() {
	   $("#music-search-box").autocomplete(Search.getArguments());

	   $("body").on("mouseover", ".playlist-item-row", function() {
		  $(this).addClass("playlist-item-row-hover");
		  $(this).find(".playlist-item-row-table").addClass("playlist-item-row-hover");
		  $(this).find(".playlist-play-hover").css("width", $(this).find(".playlist-item-image").width() + "px");
		  $(this).find(".playlist-play-hover").removeClass("hidden");
	   });

	   $("body").on("mouseleave", ".playlist-item-row", function() {
		  $(this).removeClass("playlist-item-row-hover");
		  $(this).find(".playlist-item-row-table").removeClass("playlist-item-row-hover");
		  $(this).find(".playlist-play-hover").addClass("hidden");
	   });

	   $("body").on("click", ".playlist-item-row", function() {
		  Player.loadVideoById($(this).data("id"));
	   });

	   $("body").on("click", ".logout", function() {
		  gapi.auth.signOut();
		  $.getJSON("json/logout.php")
			 .success(function() {
				window.location = "login.php";
			 });
	   });
    };

    var initWebSocketClient = function() {
	   WebSocketClient.initialize();
    };

    $(document).ready(init);
});

