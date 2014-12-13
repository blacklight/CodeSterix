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
    "lib/handlebars",
    "player",
    "playlist",
    "search",
    "lib/bootstrap",
    "lib/jquery.ui.autocomplete.html",
], function($, Handlebars, Player, Playlist, Search) {
    "use strict";

    var headerTemplate,
	   emptyPlaylistTemplate,
	   playerLoadingTemplate;

    var init = function() {
	   initTemplates();
	   initElements();
	   initBindings();
    };

    var initTemplates = function() {
	   headerTemplate = Handlebars.compile($("#header-template").html());
	   emptyPlaylistTemplate = Handlebars.compile($("#empty-playlist-template").html());
	   playerLoadingTemplate = Handlebars.compile($("#player-loading-template").html());
    };

    var initElements = function() {
	   $("#header").html(headerTemplate);
	   $("#playlist-container").html(emptyPlaylistTemplate);
	   $("#player-loading-video").html(playerLoadingTemplate);

	   setTimeout(function() {
		  $(".empty-playlist").css("margin-top", (parseInt($("#playlist-container").height()/2) - 60) + "px");
	   }, 10);
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
    };

    $(document).ready(init);
});

