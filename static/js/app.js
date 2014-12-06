$(document).ready(function() {
    var searchItemTemplate = Handlebars.compile($("#search-item").html()),
	   headerTemplate = Handlebars.compile($("#header-template").html());

    var init = function() {
	   initHeader();
	   initBindings();
    };

    var initHeader = function() {
	   $("#header").html(headerTemplate);
    };

    var initBindings = function() {
	   var pendingRequest;

	   $("#music-search-box")
	   .on("keypress", function(event) {
		  if (event.which === 13) {
			 var spotifyID = $(this).val().trim();
			 loadTrack(spotifyID);
		  }
	   })
	   .autocomplete({
		  minLength: 4,
		  html: true,
		  select: function(event, ui) {
			 var $item = $(ui.item.value);
			 if ($item.length && $item.data("id")) {
				setTimeout(function() {
				    $("#music-search-box").val($item.data("artist") + " - " + $item.data("name"));
				    loadTrack($item.data("id"));
				}, 10)
			 } else {
				setTimeout(function() {
				    $("#music-search-box").val("");
				}, 10)
			 }
		  },

		  focus: function() {
			 return false;
		  },

		  source: function(request, response) {
			 $("#music-search-box").addClass("loading");
			 if (pendingRequest) {
				clearTimeout(pendingRequest);
			 }

			 pendingRequest = setTimeout(function() {
				$.get("https://api.spotify.com/v1/search",
				    {
					   type: "track",
					   q: request.term,
				    }
				)
				.success(function(data) {
				    if (data.tracks.items) {
					   var tracks = [];
					   data.tracks.items.forEach(function(item) {
						  item.artist = "";
						  item.artists.forEach(function(artist) {
							 if (item.artist.length > 0) {
								item.artist += ", ";
							 }
							 item.artist += artist.name;
						  });

						  tracks.push(searchItemTemplate(item));
					   });

					   response(tracks);
				    } else {
					   tracks.push("No such track");
				    }
				})
				.error(function(jqxhr, state, error) {
				    console.log(error);
				})
				.always(function() {
				    $("#music-search-box").removeClass("loading");
				});
			 }, 500);
		  }
	   });

	   $("#music-search-submit").on("click", function(event) {
		  var spotifyID = $("#music-search-box").val().trim();
		  loadTrack(spotifyID);
	   });
    };

    var loadTrack = function(spotifyID) {
	   $("#song-wrapper").attr("src", "https://embed.spotify.com/?uri=spotify:track:" + spotifyID);
    };

    init();
});

