<?php

require_once "db.php";

class DbUserRoomHistory extends Db {
    protected $table_name = "tonlist_user_room_history";
    protected $columns = array(
	   "id",
	   "session_id",
	   "room_id",
	   "last_updated_at",
    );

    protected $primary_key = ["id"];
}

$_DB["user_room_history"] = new DbUserRoomHistory();

?>
