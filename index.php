<html>

<head>
    <title>T&oacute;nlist</title>

    <!-- JS -->
    <script language="javascript" type="text/javascript" src="static/js/require.js" data-main="static/js/app"></script>

    <!-- CSS -->
    <link rel="stylesheet" type="text/css" href="static/css/jquery-ui.min.css">
    <link rel="stylesheet" type="text/css" href="static/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="static/css/style.css">

    <!-- Templates -->
    <?php
	   include('templates/header.comp');
	   include('templates/search.comp');
	   include('templates/playlist.comp');
	   include('templates/player.comp');
    ?>
</head>

<body>
    <div id="header"></div>
    <div class="row">
	   <div class="col-xs-5 col-sm-5 col-md-5 col-lg-5 main-panel main-panel-left">
		  <div id="player-no-video"></div>
		  <div id="player-loading-video" class="hidden"></div>
		  <div id="player"></div>
		  <input type="hidden" id="player-tube">
		  <input type="hidden" id="current-video-id">
	   </div>
	   <div class="col-xs-5 col-sm-5 col-md-5 col-lg-5 main-panel main-panel-center">
		  <div id="playlist-container"></div>
	   </div>
	   <div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 main-panel main-panel-right">
		  <div id="users-container"></div>
	   </div>
    </div>
</body>
</html>

