<?php

require_once "adminhandler.php";
require_once TONLIST_PATH . "/lib/db/db_room.php";
require_once TONLIST_PATH . "/lib/db/db_user.php";

header('Content-Type: application/json; charset=utf8');

if (!isset($_REQUEST["room_id"])) {
    header('HTTP/1.0 400 Bad Request');
    exit(1);
}

$room = $_DB["room"]->retrieve($_REQUEST["room_id"]);
if (!$room) {
    header('HTTP/1.0 404 Not Found');
    exit(1);
}

$creator = $_DB["user"]->retrieve($room->creator_user_id);
$room->creator = array(
    "name"       => $creator->name,
    "given_name" => $creator->given_name,
    "picture"    => $creator->picture,
);

$stmt = $_DB["room"]->get_room_users($_REQUEST["room_id"]);
$room->users = array();
while ($user = $stmt->fetchObject()) {
    array_push($room->users, $user);
}

$stmt = $_DB["room"]->get_room_tracks($_REQUEST["room_id"]);
$room->tracks = array();
while ($track = $stmt->fetchObject()) {
    if (isset($track->playing) && intval($track->playing) == 1) {
	   $room->playing = $track;
    }

    array_push($room->tracks, $track);
}

print json_encode(array(
    "room" => $room
));

?>
