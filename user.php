<?php

require_once "gapi.php";

session_start();

if (!(isset($_SESSION["access_token"]) && $_SESSION["access_token"])) {
    header('Location: ' . filter_var(LOGIN_URI, FILTER_SANITIZE_URL));
}

$token = json_decode($_SESSION["access_token"]);
$params = array(
    "alt" => "json",
    "access_token" => $token->access_token,
);

$userinfo = file_get_contents("https://www.googleapis.com/oauth2/v2/userinfo?" . http_build_query($params));

if (!$userinfo || $userinfo == "") {
    die ("Unable to retrieve user information");
}

$userinfo = json_decode($userinfo);
print "<pre>
    $userinfo->id
    $userinfo->email
    $userinfo->name
    $userinfo->picture
<pre>";

session_unset();
session_destroy();

?>
