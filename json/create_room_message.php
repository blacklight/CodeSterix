<?php

require_once "../conf.php";
require_once TONLIST_PATH . "/lib/db/db_room_message.php";

header('Content-Type: application/json; charset=utf8');

if (!(
       isset($_REQUEST["room_id"])
    && isset($_REQUEST["user_id"])
    && isset($_REQUEST["message"])
)) {
    header('HTTP/1.0 400 Bad Request');
    exit(1);
}

$msg = $_DB["room_message"]->create(array(
    "room_id" => $_REQUEST["room_id"],
    "user_id" => $_REQUEST["user_id"],
    "message" => $_REQUEST["message"],
));

print json_encode(array(
    "message" => $msg
));

?>
