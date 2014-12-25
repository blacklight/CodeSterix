<?php

require_once "db.php";

class DbRoomTrackHistory extends Db {
    protected $table_name = "tonlist_room_track_history";
    protected $columns = array(
	   "id",
	   "room_track_id",
	   "room_id",
	   "youtube_id",
	   "creator_user_id",
	   "created_at",
    );

    protected $primary_key = "id";
}

$_DB["room_track_history"] = new DbRoomTrackHistory();

?>
