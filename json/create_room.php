<?php

require_once "../conf.php";
require_once TONLIST_PATH . "/lib/db/db_room.php";
require_once TONLIST_PATH . "/lib/db/db_room_history.php";

session_start();
header('Content-Type: application/json; charset=utf8');

if (!isset($_SESSION["user"])) {
    header('HTTP/1.0 403 Forbidden');
    exit(1);
}

if (!isset($_REQUEST["name"]) || $_REQUEST["name"] == "") {
    header('HTTP/1.0 400 Bad Request');
    exit(1);
}

$room = $_DB["room"]->insert(array(
    "name"            => $_REQUEST["name"],
    "is_public"       => 1,
    "creator_user_id" => $_SESSION["user"]->id,
));

$_DB["room_history"]->insert_ignore(array(
    "room_id"         => $room->id,
    "name"            => $_REQUEST["name"],
    "is_public"       => 1,
    "creator_user_id" => $_SESSION["user"]->id,
));

print json_encode(array("room" => $room));

?>
