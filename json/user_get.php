<?php

require_once "../conf.php";
require_once TONLIST_PATH . "/lib/db/db_user.php";

header('Content-Type: application/json; charset=utf8');

if (!isset($_REQUEST["user_id"])) {
    header('HTTP/1.0 400 Bad Request');
    exit(1);
}

$user = $_DB["user"]->retrieve($_REQUEST["user_id"]);
if (!$user) {
    header('HTTP/1.0 404 Not Found');
    exit(1);
}

print json_encode(array(
    "user" => array(
	   "id"         => $user->id,
	   "name"       => $user->name,
	   "given_name" => $user->given_name,
	   "picture"    => $user->picture,
    )
));

?>
