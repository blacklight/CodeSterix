<?php

require_once "../conf.php";
require_once TONLIST_PATH . "/lib/db/db_session.php";

header('Content-Type: application/json; charset=utf8');

if (!isset($_REQUEST["session_id"])) {
    header('HTTP/1.0 403 Forbidden');
    exit(1);
}

$session = $_DB["user_session"]->retrieve($_REQUEST["session_id"]);

if ($session) {
    print json_encode(array("session" => $session));
} else {
    header('HTTP/1.0 403 Forbidden');
    exit(1);
}

?>
