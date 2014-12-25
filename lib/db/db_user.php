<?php

require_once "db_room.php";
require_once "db_user_room.php";
require_once "db_user_room_history.php";

global $_DB;

class DbUser extends Db {
    protected $table_name = "tonlist_user";
    protected $columns = array(
	   "id",
	   "google_id",
	   "name",
	   "given_name",
	   "email",
	   "picture",
    );

    protected $primary_key = "id";

    public function disconnect($user_id, $new_room_id = null) {
	   global $_DB;

	   if (!$new_room_id) {
		  $this->query("UPDATE " . $this->table_name
			 . " SET logged_in = 0 WHERE id = ?",
			 $user_id);
	   }

	   $rooms = $_DB["user_room"]->search_where(array(
		  "user_id" => $user_id
	   ));

	   while ($user_room = $rooms->fetchObject()) {
		  if ($new_room_id && $user_room->room_id == $new_room_id) {
			 continue;
		  }

		  $this->query("DELETE FROM " . $_DB["user_room"]->get_table_name()
			 . " WHERE user_id = ? AND room_id = ?",
			 $user_id, $user_room->room_id);

		  $user_cnt = $_DB["user_room"]->query("SELECT COUNT(*) AS cnt
			 FROM " . $_DB["user_room"]->get_table_name() . "
			 WHERE room_id = ?",
			 $user_room->room_id);

		  $user_cnt = $user_cnt->fetchObject();
		  if ($user_cnt->cnt == 0) {
			 $_DB["room"]->query("DELETE FROM " . $_DB["room"]->get_table_name() .
				" WHERE id = ?",
				$user_room->room_id);
		  }
	   }
    }

    public function enter_room($args) {
	   global $_DB;

	   $this->disconnect($args["user_id"], $args["room_id"]);

	   $this->query("UPDATE " . $this->table_name
		  . " SET logged_in = 1 WHERE id = ?",
		  $args["user_id"]);

	   $_DB["user_room"]->insert_ignore(array(
		  "user_id" => $args["user_id"],
		  "room_id" => $args["room_id"],
	   ));

	   $_DB["user_room_history"]->insert_ignore(array(
		  "user_id" => $args["user_id"],
		  "room_id" => $args["room_id"],
	   ));
    }
}

$_DB["user"] = new DbUser();

?>
