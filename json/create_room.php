<?php

require_once "adminhandler.php";
require_once TONLIST_PATH . "/lib/db/db_room.php";
require_once TONLIST_PATH . "/lib/db/db_room_history.php";

if (!isset($_REQUEST["name"]) || $_REQUEST["name"] == "") {
    header('HTTP/1.0 400 Bad Request');
    exit(1);
}

$room = $_DB["room"]->insert(array(
    "name"            => $_REQUEST["name"],
    "is_public"       => 1,
    "creator_user_id" => $u->id,
));

$_DB["room_history"]->insert_ignore(array(
    "room_id"         => $room->id,
    "name"            => $_REQUEST["name"],
    "is_public"       => 1,
    "creator_user_id" => $u->id,
));

print json_encode(array("room" => $room));

?>
