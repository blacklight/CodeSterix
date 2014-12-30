<?php

require_once "adminhandler.php";
require_once TONLIST_PATH . "/lib/db/db_room_track.php";

if (!isset($_REQUEST["room_track_id"])) {
    header('HTTP/1.0 400 Bad Request');
    exit(1);
}

$room_track = $_DB["room_track"]->retrieve($_REQUEST["room_track_id"]);
if (!$room_track) {
    header('HTTP/1.0 404 Not Found');
    exit(1);
}

$_DB["room_track"]->mark_as_played($room_track->id);

print json_encode(array(
    "status" => "ok"
));

?>
