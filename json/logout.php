<?php

require_once "../conf.php";
require_once TONLIST_PATH . "/lib/db/db_auth_type.php";

header('Content-Type: application/json; charset=utf8');
session_start();

if (isset($_SESSION["access_token"])) {
    $token = $_SESSION["access_token"];
}

if (isset($_COOKIE["access_token"])) {
    $token = $_COOKIE["access_token"];
    setcookie("access_token", null, -1);
}

if (isset($_COOKIE["auth_type_id"])) {
    $auth_type_id = $_COOKIE["auth_type_id"];
    setcookie("auth_type_id", null, -1);
}

if (isset($auth_type_id) && isset($token)) {
    if ($auth_type_id == DbAuthType::GOOGLE_AUTH_TYPE_ID) {
	   file_get_contents("https://accounts.google.com/o/oauth2/revoke?" .
		  http_build_query(array("token" => $token))
	   );
    } elseif ($auth_type_id == DbAuthType::FACEBOOK_AUTH_TYPE_ID) {
	   $curl = curl_init();
	   curl_setopt($curl, CURLOPT_URL, "https://graph.facebook.com/me/permissions/?"
		  . http_build_query(array("access_token" => $token)));

	   curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
	   curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
	   curl_setopt($curl, CURLOPT_HEADER, 1);
	   $output = curl_exec($curl);
	   error_log($output);
	   curl_close($curl);
    }
}

session_unset();
session_destroy();

header("Content-type", "application/json");
print json_encode(array(
    "status" => array(
	   "logged_out" => true
    )
));

?>
