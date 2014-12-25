<?php

require_once "../conf_secret.php";

header('Content-Type: application/json; charset=utf8');

if (!isset($_REQUEST["q"]) && !isset($_REQUEST["id"])) {
    die("Missing required \"q\" or \"id\" argument");
}

if (isset($_REQUEST["id"])) {
	$result = file_get_contents("https://www.googleapis.com/youtube/v3/videos?" .
	    http_build_query(array(
		   "key"   => GOOGLE_API_KEY,
		   "part"  => "snippet",
		   "id"     => $_REQUEST["id"],
	    ))
	);
} else {
	$result = file_get_contents("https://www.googleapis.com/youtube/v3/search?" .
	    http_build_query(array(
		   "key"   => GOOGLE_API_KEY,
		   "part"  => "snippet",
		   "order" => "relevance",
		   "q"     => $_REQUEST["q"],
	    ))
	);
}

print $result;
?>
