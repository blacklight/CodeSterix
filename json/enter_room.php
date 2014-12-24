<?php

require_once "../conf.php";
require_once TONLIST_PATH . "/lib/db/db_session.php";
require_once TONLIST_PATH . "/lib/db/db_user_room.php";

header('Content-Type: application/json');

if (!isset($_REQUEST["session_id"]) || !isset($_REQUEST["room_id"])) {
    header('HTTP/1.0 400 Bad Request');
    exit(1);
}

$session = $_DB["user_session"]->retrieve($_REQUEST["session_id"]);
if (!$session) {
    header('HTTP/1.0 403 Forbidden');
    exit(1);
}

$_DB["user_room"]->enter_room(array(
    "user_id" => $session->user_id,
    "room_id" => $_REQUEST["room_id"],
));

print json_encode(array(
    "status" => "ok"
));

?>
