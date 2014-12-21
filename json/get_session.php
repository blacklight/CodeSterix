<?php

require_once "../conf.php";
require_once "../lib/db/db_session.php";

header('Content-Type: application/json');

if (!isset($_REQUEST["session_id"])) {
    die("Missing required \"session_id\" argument");
}

$db_session = new DbUserSession();
$session = $db_session->retrieve($_REQUEST["session_id"]);

if ($session) {
    print json_encode(array("session" => $session));
} else {
    print json_encode(array("error" => "No such session"));
}

?>
