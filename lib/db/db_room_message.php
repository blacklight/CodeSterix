<?php

require_once "db_room_message_history.php";

global $_DB;

class DbRoomMessage extends Db {
    protected $table_name = "tonlist_room_message";
    protected $columns = array(
	   "id",
	   "room_id",
	   "user_id",
	   "message",
	   "created_at",
    );

    protected $primary_key = "id";

    public function create($args) {
	   global $_DB;

	   $msg = $this->insert($args);
	   $_DB["room_message_history"]->insert(array(
		  "id"         => $msg->id,
		  "room_id"    => $msg->room_id,
		  "user_id"    => $msg->user_id,
		  "message"    => $msg->message,
		  "created_at" => $msg->created_at,
	   ));

	   return $msg;
    }
}

$_DB["room_message"] = new DbRoomMessage();

?>
