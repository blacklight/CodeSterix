$(document).ready(function() {
if (annyang) {
    // Let's define our first command. First the text we expect, and then the function it should call
    var commands = {
	   'play (the song) *song': playSong,
	   'play (the song) *song by *artist': playSong,
	   'stop': stop
    };

    var audio = null;
    function playSong(song, artist) {
	   var recognizedElement = document.getElementById('recognized');
	   recognizedElement.innerText = 'Recognized "' + song + (artist ? ' by ' + artist : '') + '"';
	   console.log("PlaySong", song);
	   var req = new XMLHttpRequest();
	   req.open('GET', 'https://api.spotify.com/v1/search?type=track&q=' + encodeURIComponent(song), true);

	   req.onreadystatechange = function() {
		  if (req.readyState == 4 && req.status == 200){
			 var data = JSON.parse(req.responseText);
			 if (data.tracks.items[0]) {
				stop();
				var matchedElement = document.getElementById('matched');
				matchedElement.innerHTML = '<div class="media"><img src="' + data.tracks.items[0].album.images[0].url + '" alt="Cover art of ' + data.tracks.items[0].album.name + '" width="300"><p>Playing ' + data.tracks.items[0].name + ' by ' + data.tracks.items[0].artists[0].name +'</p></div>';
				audio = new Audio(data.tracks.items[0].preview_url);
				audio.play();
			 }
		  }
	   };
	   req.send(null);
    }

    function stop() {
	   if (audio) {
		  audio.pause();
		  audio = null;
	   }
    } 

    function stop() {
	   if (audio) {
		  audio.pause();
	   }
    }    

    // Add our commands to annyang
    annyang.addCommands(commands);

    // Start listening. You can call this here, or attach this call to an event, button, etc.
    annyang.start();
    annyang.debug();
}
});

