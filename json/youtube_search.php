<?php

require_once "../conf_secret.php";
require_once "adminhandler.php";

if (!isset($_REQUEST["q"]) && !isset($_REQUEST["id"])) {
    header('HTTP/1.0 400 Bad Request');
    exit(1);
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
