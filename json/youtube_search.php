<?php
header('Content-Type: application/json');

if (!$_REQUEST["q"]) {
    die("Missing required \"q\" argument");
}

$googleApiKey = "AIzaSyAZw6zjZFuOd7Muxh9S6QQwYNyNIafkFMM";
$result = file_get_contents("https://www.googleapis.com/youtube/v3/search?" .
    http_build_query(array(
	   "key"   => $googleApiKey,
	   "part"  => "snippet",
	   "order" => "relevance",
	   "q"     => $_REQUEST["q"],
    ))
);

print $result;
?>
