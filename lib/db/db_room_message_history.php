<?php

require_once "db.php";

class DbRoomMessageHistory extends Db {
    protected $table_name = "tonlist_room_message_history";
    protected $columns = array(
	   "id",
	   "room_id",
	   "user_id",
	   "message",
	   "created_at",
    );

    protected $primary_key = "id";
}

$_DB["room_message_history"] = new DbRoomMessageHistory();

?>
