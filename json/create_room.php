<?php

require_once "../conf.php";
require_once TONLIST_PATH . "/lib/db/db_session.php";
require_once TONLIST_PATH . "/lib/db/db_room.php";
require_once TONLIST_PATH . "/lib/db/db_room_history.php";

header('Content-Type: application/json');

if (!isset($_REQUEST["session_id"])) {
    header('HTTP/1.0 403 Forbidden');
    exit(1);
}

if (!isset($_REQUEST["name"]) || $_REQUEST["name"] == "") {
    header('HTTP/1.0 400 Bad Request');
    exit(1);
}

$session = $_DB["user_session"]->retrieve($_REQUEST["session_id"]);
if (!$session) {
    header('HTTP/1.0 403 Forbidden');
    exit(1);
}

$room = $_DB["room"]->insert(array(
    "name"            => $_REQUEST["name"],
    "active"          => 1,
    "is_public"       => 1,
    "creator_user_id" => $session->user_id,
));

$_DB["room_history"]->insert_ignore(array(
    "room_id"         => $room->id,
    "name"            => $_REQUEST["name"],
    "active"          => 1,
    "is_public"       => 1,
    "creator_user_id" => $session->user_id,
));

print json_encode(array("room" => $room));

?>
