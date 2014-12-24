<?php

require_once "../conf.php";
require_once TONLIST_PATH . "/lib/db/db_user.php";

session_start();
header('Content-Type: application/json');

if (!isset($_REQUEST["room_id"])) {
    header('HTTP/1.0 400 Bad Request');
    exit(1);
}

if (!isset($_SESSION["user"])) {
    header('HTTP/1.0 403 Forbidden');
    exit(1);
}

$_DB["user"]->enter_room(array(
    "user_id" => $_SESSION["user"]->id,
    "room_id" => $_REQUEST["room_id"],
));

print json_encode(array(
    "status" => "ok"
));

?>
