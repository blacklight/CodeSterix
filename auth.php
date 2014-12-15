<?php

require_once "conf.php";
require_once "google-api-php-client/autoload.php";

session_start();

if (isset($_COOKIE["access_token"]) && !isset($_SESSION["access_token"])) {
    $_SESSION["access_token"] = $_COOKIE["access_token"];
}

if (isset($_SESSION["access_token"]) && !isset($_COOKIE["access_token"])) {
    setcookie("access_token", $_SESSION["access_token"], time() + 60*60*24*365);
}

$client = new Google_Client();
$client->setClientId(CLIENT_ID);
$client->setClientSecret(CLIENT_SECRET);
$client->setRedirectUri(REDIRECT_URI);
$client->setScopes(array(
    "https://www.googleapis.com/auth/plus.login",
    "https://www.googleapis.com/auth/plus.me",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
));

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
	   $userinfo->google_id = $userinfo->id;
	   $user = $db->get_user($userinfo->google_id);
	   if (!$user) {
		  $db->create_user($userinfo);
		  $user = $db->get_user($userinfo->google_id);
	   }

	   $_SESSION["user"] = $user;
    } else {
	   setcookie("access_token", null, -1);
	   unset($_SESSION["access_token"]);
    }
}

if (isset($user) && $user) {
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
