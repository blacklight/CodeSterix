(function($, window, document, Handlebars) {
    'use strict';

    var player,
	   $video,
	   $currentVideoID,
	   $musicSearchBox,
	   $musicSearchSubmit;

    var searchItemTemplate,
	   headerTemplate,
	   emptyPlaylistTemplate,
	   playlistRowTemplate;

    var init = function() {
	   initTemplates();
	   initElements();
	   cacheSelectors();
	   initBindings();
    };

    var cacheSelectors = function() {
	   $musicSearchBox = $("#music-search-box");
	   $musicSearchSubmit = $("#music-search-submit");
	   $currentVideoID = $("#current-video-id");
    };

    var initTemplates = function() {
	   searchItemTemplate = Handlebars.compile($("#search-item").html());
	   headerTemplate = Handlebars.compile($("#header-template").html());
	   emptyPlaylistTemplate = Handlebars.compile($("#empty-playlist-template").html());
	   playlistRowTemplate = Handlebars.compile($("#playlist-row-template").html());
    };

    var initElements = function() {
	   $("#header").html(headerTemplate);
	   $("#playlist-container").html(emptyPlaylistTemplate);
	   $(".empty-playlist").css("margin-top", (parseInt($("#playlist-container").height()/2) - 60) + "px");
	   $("#player").player({
		  width: "100%",
		  video: 'AlaRjP8pg0Q',
		  ready: function() {
			 $video = $("#player").data("player");
		  },
	   });
    };

    var initBindings = function() {
	   var pendingRequest;

	   $musicSearchBox
	   .on("keypress", function(event) {
		  if (event.which === 13) {
			 loadTrack($currentVideoID.val());
		  }
	   })
	   .autocomplete({
		  minLength: 4,
		  html: true,
		  select: function(event, ui) {
			 var $item = $(ui.item.value);
			 setTimeout(function() {
				$musicSearchBox.val("");
			 }, 10);

			 if ($item.length && $item.data("id")) {
				var track = {
				    id                 : $item.data("id"),
				    name               : $item.data("name"),
				    description        : $item.data("artist"),
				    displayName        : $item.data("display-name"),
				    displayDescription : $item.data("display-description"),
				    image              : $item.data("image-url"),
				};

				setTimeout(function() {
				    $currentVideoID.val(track.id);
				    appendToPlaylist(track);
				    loadTrack(track.id);
				}, 10)
			 }
		  },

		  focus: function() {
			 return false;
		  },

		  source: function(request, response) {
			 $musicSearchBox.addClass("loading");
			 if (pendingRequest) {
				clearTimeout(pendingRequest);
			 }

			 pendingRequest = setTimeout(function() {
				$.get("json/youtube_search.php",
				    {
					   q: request.term,
				    }
				)
				.success(function(data) {
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
							 image       : item.snippet.thumbnails ? item.snippet.thumbnails.default.url : undefined,
						  };

						  itemArgs.displayName = itemArgs.name.length > 50 ? itemArgs.name.substr(0, 50) + " ..." : itemArgs.name;
						  itemArgs.displayDescription = itemArgs.description.length > 50 ? itemArgs.description.substr(0, 50) + " ..." : itemArgs.description;

						  tracks.push(searchItemTemplate(itemArgs));
					   });
				    } else {
					   tracks.push("No such track");
				    }

				    response(tracks);
				})
				.error(function(jqxhr, state, error) {
				    console.error(error);
				})
				.always(function() {
				    $musicSearchBox.removeClass("loading");
				});
			 }, 500);
		  }
	   });

	   $musicSearchSubmit.on("click", function(event) {
		  var id = $currentVideoID.val().trim();
		  loadTrack(id);
	   });

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
		  loadTrack($(this).data("id"));
	   });
    };

    var loadTrack = function(id) {
	   $video.p.loadVideoById(id);
    };

    var appendToPlaylist = function(track) {
	   $(".empty-playlist").remove();
	   $("#playlist-container").append(playlistRowTemplate(track));
    };

    $(document).ready(init);
}(jQuery, window, window.document, Handlebars));

