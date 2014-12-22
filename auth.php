<?php

require_once "conf.php";
require_once "lib/db/db_user.php";
require_once "lib/db/db_session.php";

session_start();

if (isset($_COOKIE["access_token"]) && !isset($_SESSION["access_token"])) {
    $_SESSION["access_token"] = $_COOKIE["access_token"];
}

if (isset($_SESSION["access_token"]) && !isset($_COOKIE["access_token"])) {
    setcookie("access_token", $_SESSION["access_token"], time() + 60*60*24*365);
}

if (isset($_SESSION["user"])) {
    $user = $_SESSION["user"];
}

if ((!isset($user) || !$user) && isset($_SESSION["access_token"])) {
    $token = $_SESSION["access_token"];

    $params = array(
	   "alt" => "json",
	   "access_token" => $token,
    );

    $userinfo = file_get_contents("https://www.googleapis.com/oauth2/v2/userinfo?" . http_build_query($params));

    if ($userinfo) {
	   $userinfo = json_decode($userinfo);
	   $user = $_DB["user"]->search_where(array(
		  "google_id" => $userinfo->id
	   ));

	   if ($user) {
		  $user = $user->fetchObject();
	   }

	   if (!$user) {
		  $user = $_DB["user"]->insert(array(
			 "google_id"  => $userinfo->id,
			 "email"      => $userinfo->email,
			 "name"       => $userinfo->name,
			 "given_name" => $userinfo->given_name,
			 "picture"    => $userinfo->picture,
		  ));
	   }

	   $_SESSION["user"] = $user;
    } else {
	   setcookie("access_token", null, -1);
	   unset($_SESSION["access_token"]);
    }
}

if (isset($user) && $user) {
    $_DB["user_session"]->store_session(array(
	   "session_id"   => $_COOKIE["PHPSESSID"],
	   "access_token" => $_COOKIE["access_token"],
	   "user_id"      => $user->id,
    ));
?>

    <input type="hidden" id="user_id" value="<?php echo $user->id ?>">
    <input type="hidden" id="user_name" value="<?php echo $user->name ?>">
    <input type="hidden" id="user_given_name" value="<?php echo $user->given_name ?>">
    <input type="hidden" id="user_email" value="<?php echo $user->email ?>">
    <input type="hidden" id="user_picture" value="<?php echo $user->picture ?>">
    <input type="hidden" id="user_picture" value="<?php echo $user->picture ?>">

<?php
} else if (!preg_match("#" . LOGIN_URI . "$#", $_SERVER["PHP_SELF"])) {
    header("Location: " . LOGIN_URI);
}
?>
