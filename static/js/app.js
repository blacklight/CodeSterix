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

    var userinfo = {},
	   headerTemplate,
	   emptyPlaylistTemplate,
	   playerLoadingTemplate;

    var init = function() {
	   initUserInfo();
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
	   $("#header").html(headerTemplate(userinfo));
	   $("#playlist-container").html(emptyPlaylistTemplate);
	   $("#player-loading-video").html(playerLoadingTemplate);
    };

    var initUserInfo = function() {
	   userinfo = {
		  id        : $("#user_id").val(),
		  name      : $("#user_name").val(),
		  givenName : $("#user_given_name").val(),
		  email     : $("#user_email").val(),
		  picture   : $("#user_picture").val(),
	   };
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
		  $.getJSON("logout.php")
			 .success(function() {
				window.location = "login.php";
			 });
	   });
    };

    $(document).ready(init);
});

