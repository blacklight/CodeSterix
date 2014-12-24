<?php

require_once "../conf.php";
require_once TONLIST_PATH . "/lib/db/db_room.php";
require_once TONLIST_PATH . "/lib/db/db_user_room.php";
require_once TONLIST_PATH . "/lib/db/db_user.php";

header('Content-Type: application/json');

$stmt = $_DB["room"]->search_where(array(
    "active"    => 1,
    "is_public" => 1,
));

$rooms = array();

while ($room = $stmt->fetchObject()) {
    if ($room->creator_user_id) {
	   $user = $_DB["user"]->retrieve($room->creator_user_id);
	   $room->creator = array(
		  "name"    => $user->name,
		  "picture" => $user->picture,
	   );
    }

    $user_stmt = $_DB["user_room"]->search_where(array(
	   "room_id" => $room->id
    ));

    $room->users = array();
    while ($user = $user_stmt->fetchObject()) {
	   array_push($room->users, $user);
    }

    array_push($rooms, $room);
}

print json_encode($rooms);

?>
