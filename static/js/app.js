$(document).ready(function() {
    var $musicSearchBox,
	   $musicSearchSubmit;

    var searchItemTemplate = Handlebars.compile($("#search-item").html()),
	   headerTemplate = Handlebars.compile($("#header-template").html()),
	   emptyPlaylistTemplate = Handlebars.compile($("#empty-playlist-template").html()),
	   playlistRowTemplate = Handlebars.compile($("#playlist-row-template").html());

    var init = function() {
	   initElements();
	   cacheSelectors();
	   initBindings();
    };

    var cacheSelectors = function() {
	   $musicSearchBox = $("#music-search-box");
	   $musicSearchSubmit = $("#music-search-submit");
    };

    var initElements = function() {
	   $("#header").html(headerTemplate);
	   $("#playlist-container").html(emptyPlaylistTemplate);
    };

    var initBindings = function() {
	   var pendingRequest;

	   $musicSearchBox
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
				var track = {
				    id     : $item.data("id"),
				    artist : $item.data("artist"),
				    name   : $item.data("name"),
				};

				setTimeout(function() {
				    $musicSearchBox.val(track.artist + " - " + track.name);
				    appendToPlaylist(track);
				    loadTrack(track.id);
				}, 10)
			 } else {
				setTimeout(function() {
				    $musicSearchBox.val("");
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
				$.get("https://api.spotify.com/v1/search",
				    {
					   type: "track",
					   q: request.term,
				    }
				)
				.success(function(data) {
				    var tracks = [];
				    if (data.tracks.items && data.tracks.items.length) {
					   data.tracks.items.forEach(function(item) {
						  if (tracks.length > 10) {
							 return;
						  }

						  item.artist = "";
						  item.artists.forEach(function(artist) {
							 if (item.artist.length > 0) {
								item.artist += ", ";
							 }
							 item.artist += artist.name;
						  });

						  if (item.album && item.album.images.length) {
							 item.albumImg = item.album.images[item.album.images.length-1].url;
						  }

						  item.displayName = item.name.length > 30
							 ? item.name.substr(0, 30) + " ..."
							 : item.name;

						  item.displayArtist = item.artist.length > 30
							 ? item.artist.substr(0, 30) + " ..."
							 : item.artist;

						  item.album.displayName = item.album.name.length > 30
							 ? item.album.name.substr(0, 30) + " ..."
							 : item.album.name;

						  tracks.push(searchItemTemplate(item));
					   });
				    } else {
					   tracks.push("No such track");
				    }

				    response(tracks);
				})
				.error(function(jqxhr, state, error) {
				    console.log(error);
				})
				.always(function() {
				    $musicSearchBox.removeClass("loading");
				});
			 }, 500);
		  }
	   });

	   $musicSearchSubmit.on("click", function(event) {
		  var spotifyID = $musicSearchBox.val().trim();
		  loadTrack(spotifyID);
	   });
    };

    var loadTrack = function(spotifyID) {
	   $("#song-wrapper").attr("src", "https://embed.spotify.com/?uri=spotify:track:" + spotifyID);
    };

    var appendToPlaylist = function(track) {
	   $(".empty-playlist").remove();
	   $("#playlist-container").append(playlistRowTemplate(track));
    };

    init();
});

