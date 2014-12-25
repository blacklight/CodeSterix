<?php

require_once "../conf.php";

session_start();
header('Content-Type: application/json; charset=utf8');

if (!isset($_SESSION["user"])) {
    header('HTTP/1.0 403 Forbidden');
    exit(1);
}

$u = $_SESSION["user"];

?>
