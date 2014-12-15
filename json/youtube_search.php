<?php

require_once "../conf_secret.php";

header('Content-Type: application/json');

if (!$_REQUEST["q"]) {
    die("Missing required \"q\" argument");
}

$result = file_get_contents("https://www.googleapis.com/youtube/v3/search?" .
    http_build_query(array(
	   "key"   => GOOGLE_API_KEY,
	   "part"  => "snippet",
	   "order" => "relevance",
	   "q"     => $_REQUEST["q"],
    ))
);

print $result;
?>
