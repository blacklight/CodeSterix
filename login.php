<?php

require_once "conf.php";
require_once "auth.php";

if (isset($_GET["code"])) {
    $client->authenticate($_GET["code"]);
    $_SESSION["access_token"] = $client->getAccessToken();
}

if (isset($user) && $user) {
    $redirect = 'http://' . $_SERVER['HTTP_HOST'] . "/" . TONLIST_URI . "/index.php";
    header('Location: ' . filter_var($redirect, FILTER_SANITIZE_URL));
}

?>

<html>
    <head>
	   <!-- JS -->
	   <script src="https://apis.google.com/js/client:platform.js" async defer></script>
	   <script language="javascript" type="text/javascript" src="static/js/jquery.js"></script>
	   <script language="javascript" type="text/javascript" src="static/js/login.js"></script>
	   <script language="javascript" type="text/javascript" src="static/js/lib/bootstrap.js"></script>

	   <!-- CSS -->
	   <link rel="stylesheet" type="text/css" href="static/css/jquery-ui.min.css">
	   <link rel="stylesheet" type="text/css" href="static/css/bootstrap.min.css">
	   <link rel="stylesheet" type="text/css" href="static/css/style.css">
	   <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
	   <link rel="icon" href="favicon.ico" type="image/x-icon">
    </head>

    <body>
	   <div id="loginForm">
		  <div class="loginLogo"></div>
		  <div class="bigName">T&oacute;nlist</div>
		  <div class="bigDescription">Interactively watch your favourite videos with your friends</div>
		  <span id="signinButton">
			 <span
				class="g-signin"
				data-callback="signinCallback"
				data-clientid="<?php echo CLIENT_ID ?>"
				data-cookiepolicy="single_host_origin"
				data-requestvisibleactions="http://schema.org/AddAction"
				data-scope="https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile email"
			 >
			 </span>
		  </span>
	   </div>
    </body>
</html>
