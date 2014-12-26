<?php

require_once "../conf.php";
require_once TONLIST_PATH . "/lib/db/db_session.php";
require_once TONLIST_PATH . "/lib/db/db_user.php";
require_once TONLIST_PATH . "/lib/db/db_room.php";

header('Content-Type: application/json; charset=utf8');

if (!isset($_REQUEST["youtube_id"]) || $_REQUEST["room_id"] == "") {
    header('HTTP/1.0 400 Bad Request');
    exit(1);
}

if (!isset($_REQUEST["session_id"])) {
    $user = $_SESSION["user"];
} else {
    $session = $_DB["user_session"]->retrieve($_REQUEST["session_id"]);
    if (!$session) {
	   header('HTTP/1.0 404 Not Found');
	   exit(1);
    }

    $user = $_DB["user"]->retrieve($session->user_id);
}

if (!$user) {
    header('HTTP/1.0 403 Forbidden');
    exit(1);
}

$_DB["room"]->change_playing_video($_REQUEST["room_id"], $_REQUEST["youtube_id"]);

print json_encode(array("status" => "ok"));

?>
