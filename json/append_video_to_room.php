<?php

require_once "../conf.php";
require_once TONLIST_PATH . "/lib/db/db_track.php";
require_once TONLIST_PATH . "/lib/db/db_room_track.php";

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION["user"])) {
    header('HTTP/1.0 403 Forbidden');
    exit(1);
}

if (!isset($_REQUEST["room_id"])
	   || !isset($_REQUEST["youtube_id"])
	   || !isset($_REQUEST["name"]
	   || !isset($_REQUEST["description"]
	   || !isset($_REQUEST["duration"]
	   || !isset($_REQUEST["image"]) {
    header('HTTP/1.0 400 Bad Request');
    exit(1);
}

$room = $_DB["room"]->retrieve($_REQUEST["room_id"]);
if (!$room) {
    header('HTTP/1.0 404 Not Found');
    exit(1);
}

$track = $_DB["track"]->create_track(array(
    "youtube_id"  => $_REQUEST["youtube_id"],
    "name"        => $_REQUEST["name"],
    "description" => $_REQUEST["description"],
    "duration"    => $_REQUEST["duration"],
    "image"       => $_REQUEST["image"],
));

$room_track = $_DB["room_track"]->insert(array(
    "room_id"          => $_REQUEST["room_id"],
    "youtube_id"       => $_REQUEST["youtube_id"],
    "creator_user_id"  => $_SESSION["user"]->id,
    "playing"          => 0,
    "playing_done"     => 0,
));

print json_encode(array(
    "track" => array(
	   "youtube_id"      => $track->youtube_id,
	   "name"            => $track->name,
	   "description"     => $track->description,
	   "duration"        => $track->duration,
	   "image"           => $track->image,
	   "room_id"         => $room_track->room_id,
	   "creator_user_id" => $room_track->creator_user_id,
	   "playing"         => $room_track->playing,
	   "playing_done"    => $room_track->playing_done,
    )
));

?>
