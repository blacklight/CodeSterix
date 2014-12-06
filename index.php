<html>

<head>
    <title>Spotify Player</title>

    <!-- JS -->
    <script language="javascript" type="text/javascript" src="static/js/lib/jquery-2.1.1.min.js"></script>
    <script language="javascript" type="text/javascript" src="static/js/lib/bootstrap.min.js"></script>
    <script language="javascript" type="text/javascript" src="static/js/lib/handlebars-v2.0.0.js"></script>
    <script language="javascript" type="text/javascript" src="static/js/lib/annyang.min.js"></script>
    <script language="javascript" type="text/javascript" src="static/js/app.js"></script>

    <!-- CSS -->
    <link rel="stylesheet" href="static/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" src="static/css/style.css">

    <!-- Templates -->
    <?php
	   include('templates/header.comp');
    ?>
</head>

<body>
    <div id="header"></div>
    <div class="row">
	   <div class="col-xs-12 col-sm-12 col-md-8 col-lg-8">
		  <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">
			 <iframe src="https://embed.spotify.com/?uri=spotify:track:4th1RQAelzqgY7wL53UGQt"
				width="100%" height="100%"
				frameborder="0" allowtransparency="true">
			 </iframe>
		  </div>
		  <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">
			 <div class="playlist-container">
				<div class="playlist-item-row">
				    <div class="playlist-item-artist">Led Zeppelin</div>
				    <div class="playlist-item-title">Stairway to Heaven</div>
				</div>
				<div class="playlist-item-row">
				    <div class="playlist-item-artist">Jimi Hendrix</div>
				    <div class="playlist-item-title">Purple Haze</div>
				</div>
			 </div>
		  </div>
	   </div>
</body>
</html>

