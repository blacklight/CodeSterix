$(function () {
	$('#spotifyLogin').on('click', function () {
		location.href = "https://accounts.spotify.com/authorize?client_id=dc83e06265e64aae813fd37a90f949ea&response_type=code&redirect_uri=http:%2F%2Fkabirsohel.koding.io%2F";
	});
});
