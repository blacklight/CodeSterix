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
	   "playing",
	   "playing_done",
    );

    protected $primary_key = "id";

    public function mark_as_played($room_track_id) {
	   return $this->query("UPDATE $this->table_name
		  SET playing_done = 1
		  WHERE id = ?", $room_track_id);
    }
}

$_DB["room_track"] = new DbRoomTrack();

?>
