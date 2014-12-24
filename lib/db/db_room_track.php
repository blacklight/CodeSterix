<?php

require_once "db.php";

class DbRoomTrack extends Db {
    protected $table_name = "tonlist_room_track";
    protected $columns = array(
	   "id",
	   "room_id",
	   "youtube_id",
	   "creator_user_id",
	   "created_at",
	   "playing_done",
    );

    protected $primary_key = "id";
}

$_DB["room_track"] = new DbRoomTrack();

?>
