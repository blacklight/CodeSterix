<?php

header('Content-Type: application/json; charset=utf8');
session_start();

if (isset($_SESSION["access_token"])) {
    $token = $_SESSION["access_token"];
}

if (isset($_COOKIE["access_token"])) {
    $token = $_COOKIE["access_token"];
    setcookie("access_token", null, -1);
}

if (isset($token)) {
    file_get_contents("https://accounts.google.com/o/oauth2/revoke?" .
	   http_build_query(array("token" => $token))
    );
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
