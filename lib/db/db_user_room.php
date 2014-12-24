<?php

require_once "db.php";

class DbUserRoom extends Db {
    protected $table_name = "tonlist_user_room";
    protected $columns = array(
	   "user_id",
	   "room_id",
	   "last_updated_at",
    );

    protected $primary_key = ["user_id", "room_id"];
}

$_DB["user_room"] = new DbUserRoom();

?>
