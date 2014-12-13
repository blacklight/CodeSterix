requirejs.config({
    baseUrl: 'static/js',
    shim: {
	   "lib/jquery.text-overflow": {
		  deps: ["jquery", "lib/jquery-ui"]
	   }
    }
});

define("search", [
    "jquery",
    "lib/handlebars",
    "playlist",
    "lib/jquery-ui",
    "lib/jquery.text-overflow",
], function($, Handlebars, Playlist) {
    "use strict";

    var searchItemTemplate = Handlebars.compile($("#search-item").html());
    var pendingRequest;

    var onSelect = function(event, ui) {
	   var $item = $(ui.item.value);
	   setTimeout(function() {
		  $("#music-search-box").val("");
	   }, 10);

	   if ($item.length && $item.data("id")) {
		  var track = {
			 id                 : $item.data("id"),
			 name               : $item.data("name"),
			 description        : $item.data("description"),
			 image              : $item.data("image-url"),
		  };

		  Playlist.append(track);
	   }
    };

    var getTracksFromResponse = function(data) {
	   var tracks = [];
	   if (data.items && data.items.length) {
		  data.items.forEach(function(item) {
			 if (item.id.kind !== "youtube#video") {
				return;
			 }

			 var itemArgs = {
				id          : item.id.videoId,
				name        : item.snippet.title,
				description : item.snippet.description,
				image       : item.snippet.thumbnails
							 ? item.snippet.thumbnails.default.url
							 : undefined,
			 };

			 tracks.push(searchItemTemplate(itemArgs));
		  });
	   } else {
		  tracks.push("No such track");
	   }

	   return tracks;
    };

    var doSearch = function(request, response) {
	   $.get("json/youtube_search.php", { q: request.term })
	   .success(function(data) {
		  var tracks = getTracksFromResponse(data);
		  response(tracks);
		  $(".search-track-text-name").textOverflow();
		  $(".search-track-text-description").textOverflow();
	   })
	   .error(function(jqxhr, state, error) {
		  console.error(error);
	   })
	   .always(function() {
		  $("#music-search-box").removeClass("loading");
	   });
    };

    var onSource = function(request, response) {
	   $("#music-search-box").addClass("loading");
	   if (pendingRequest) {
		  clearTimeout(pendingRequest);
	   }

	   pendingRequest = setTimeout(function() {
		  doSearch(request, response);
	   }, 500);
    };

    var getArguments = function() {
	   return {
		  minLength: 4,
		  html: true,
		  select: onSelect,
		  source: onSource,
		  focus: function() {
			 return false;
		  },
	   }
    };

    return {
	   getArguments: getArguments,
    };
});

