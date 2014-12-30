<?php

require_once "adminhandler.php";
require_once TONLIST_PATH . "/lib/db/db_room.php";
require_once TONLIST_PATH . "/lib/db/db_user.php";

if (!isset($_REQUEST["room_id"])) {
    header('HTTP/1.0 400 Bad Request');
    exit(1);
}

$room = $_DB["room"]->retrieve($_REQUEST["room_id"]);
if (!$room) {
    header('HTTP/1.0 404 Not Found');
    exit(1);
}

$_DB["user"]->enter_room(array(
    "session_id" => $_COOKIE["PHPSESSID"],
    "room_id"    => $_REQUEST["room_id"],
));

print json_encode(array(
    "status" => "ok"
));

?>
