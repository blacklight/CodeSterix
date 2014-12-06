$(function () {

	var loginWithSpotify = function () {
		$.ajax({
			url: 'https://accounts.spotify.com/authorize',
			data: {
				client_id: '1060cd75ef7745668f19034484496bda',
				response_type: 'code',
				redirect_uri: 'http://kabirsohel.koding.io'
			}		
		});
	}
	$('#spotifyLogin').on('click', loginWithSpotify);
});
