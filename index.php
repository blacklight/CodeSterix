<?php
	$code = htmlspecialchars($_GET["code"]);
	$state = htmlspecialchars($_GET["state"]);
	$error = htmlspecialchars($_GET["error"]);
	
	if(error == NULL){
		echo "\nLoggedin successfully";
	}

	$url = 'http://server.com/path';
	$data = array('key1' => 'value1', 'key2' => 'value2');

	// use key 'http' even if you send the request to https://...
	$options = array(
		'http' => array(
			'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
			'method'  => 'POST',
			'content' => http_build_query($data),
		),
	);
	$context  = stream_context_create($options);
	//$result = file_get_contents($url, false, $context);
?>

<html>

<head>
    <title>Spotify Player</title>

    <!-- JS -->
    <script language="javascript" type="text/javascript" src="static/js/lib/jquery-2.1.1.min.js"></script>
    <script language="javascript" type="text/javascript" src="static/js/lib/jquery-ui.min.js"></script>
    <script language="javascript" type="text/javascript" src="static/js/lib/jquery.ui.autocomplete.html.js"></script>
    <script language="javascript" type="text/javascript" src="static/js/lib/bootstrap.min.js"></script>
    <script language="javascript" type="text/javascript" src="static/js/lib/handlebars-v2.0.0.js"></script>
    <script language="javascript" type="text/javascript" src="static/js/app.js"></script>

    <!-- CSS -->
    <link rel="stylesheet" type="text/css" href="static/css/jquery-ui.min.css">
    <link rel="stylesheet" type="text/css" href="static/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="static/css/style.css">

    <!-- Templates -->
    <?php
	   include('templates/header.comp');
	   include('templates/search.comp');
	   include('templates/playlist.comp');
    ?>
</head>

<body>
    <div id="header"></div>
    <div class="row">
	   <div class="col-xs-12 col-sm-12 col-md-8 col-lg-8">
		  <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">
			 <iframe src="https://embed.spotify.com/?uri=spotify:track:4th1RQAelzqgY7wL53UGQt"
				id="song-wrapper" width="100%" height="100%"
				frameborder="0" allowtransparency="true">
			 </iframe>
		  </div>
		  <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">
			 <div id="playlist-container"></div>
		  </div>
	   </div>
</body>
</html>

