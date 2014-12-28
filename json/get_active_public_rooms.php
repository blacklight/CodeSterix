<?php

require_once "adminhandler.php";
require_once TONLIST_PATH . "/lib/db/db_room.php";
require_once TONLIST_PATH . "/lib/db/db_user_room.php";
require_once TONLIST_PATH . "/lib/db/db_user.php";

$stmt = $_DB["room"]->search_where(array(
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

    $track_stmt = $_DB["room"]->get_room_tracks($room->id);
    $room->tracks = array();
    while ($track = $track_stmt->fetchObject()) {
	   array_push($room->tracks, $track);
	   if (isset($track->playing) && intval($track->playing) == 1) {
		  $room->current_track = $track;
	   }
    }

    array_push($rooms, $room);
}

print json_encode($rooms);

?>
