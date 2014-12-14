<?php

require_once "google-api-php-client/autoload.php";

const CLIENT_ID = "984540381166-u3bv62sb6ggppljn77dsue93m9b4fl3j.apps.googleusercontent.com";
const CLIENT_SECRET = "iBpvjqJK1YHZDP4qNzMtnqwF";
const REDIRECT_URI = "./oauth2.php";

$client = new Google_Client();
$client->setClientId(CLIENT_ID);
$client->setClientSecret(CLIENT_SECRET);
$client->setRedirectUri(REDIRECT_URI);
$client->setScopes("https://www.googleapis.com/auth/plus.login");

$authUrl = $client->createAuthUrl();
var_dump($authUrl);

?>

