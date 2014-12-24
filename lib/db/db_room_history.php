<?php

require_once "db.php";

class DbRoomHistory extends Db {
    protected $table_name = "tonlist_room_history";
    protected $columns = array(
	   "id",
	   "room_id",
	   "name",
	   "active",
	   "creator_user_id",
	   "created_at",
	   "is_public",
    );

    protected $primary_key = "id";
}

$_DB["room_history"] = new DbRoomHistory();

?>
