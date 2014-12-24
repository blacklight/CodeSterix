<?php

require_once "auth.php";

?>

<html>

<head>
    <title>T&oacute;nlist</title>

    <!-- JS -->
    <script src="https://apis.google.com/js/client:platform.js" async defer></script>
    <script language="javascript" type="text/javascript" src="static/js/require.js" data-main="static/js/app"></script>

    <!-- CSS -->
    <link rel="stylesheet" type="text/css" href="static/css/jquery-ui.min.css">
    <link rel="stylesheet" type="text/css" href="static/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="static/css/style.css">
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
    <link rel="icon" href="favicon.ico" type="image/x-icon">

    <!-- Templates -->
    <?php
	   include('templates/header.comp');
	   include('templates/search.comp');
	   include('templates/playlist.comp');
	   include('templates/player.comp');
	   include('templates/rooms_modal.comp');
	   include('templates/users_list.comp');
    ?>
</head>

<body>
    <div id="header"></div>
    <div id="rooms-modal-container"></div>
    <div class="row hidden" id="panel-container">
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

