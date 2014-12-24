<?php

require_once "db_user_room_history.php";
global $_DB;

class DbUserRoom extends Db {
    protected $table_name = "tonlist_user_room";
    protected $columns = array(
	   "user_id",
	   "room_id",
	   "last_updated_at",
    );

    protected $primary_key = ["user_id", "room_id"];

    public function enter_room($args) {
	   global $_DB;

	   $this->query("DELETE FROM " . $this->table_name . " WHERE user_id = ? AND room_id = ?",
		  $args["user_id"], $args["room_id"]);

	   $this->insert(array(
		  "user_id" => $args["user_id"],
		  "room_id" => $args["room_id"],
	   ));

	   $_DB["user_room_history"]->insert(array(
		  "user_id" => $args["user_id"],
		  "room_id" => $args["room_id"],
	   ));
    }
}

$_DB["user_room"] = new DbUserRoom();

?>
