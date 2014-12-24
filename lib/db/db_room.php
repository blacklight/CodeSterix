<?php

require_once "db_user.php";
require_once "db_track.php";
require_once "db_user_room.php";
require_once "db_room_track.php";

global $_DB;

class DbRoom extends Db {
    protected $table_name = "tonlist_room";
    protected $columns = array(
	   "id",
	   "name",
	   "creator_user_id",
	   "created_at",
	   "is_public",
    );

    protected $primary_key = "id";

    public function get_room_users($room_id) {
	   global $_DB;

	   return $this->query("
		  SELECT u.name
			  , u.given_name
			  , u.picture
			  , ur.last_updated_at AS connected_since
		    FROM " . $_DB["user"]->get_table_name() . " u
		    JOIN " . $_DB["user_room"]->get_table_name() . " ur
		      ON ur.user_id = u.id
		    JOIN " . $this->table_name . " r
			 ON ur.room_id = r.id
		   WHERE r.id = ?",
		  $room_id);
    }

    public function get_room_tracks($room_id) {
	   global $_DB;

	   return $this->query("
		  SELECT t.*
			  , u.name AS user_name
			  , u.given_name AS user_given_name
			  , u.picture AS user_picture
			  , rt.created_at AS track_created_at
		    FROM " . $_DB["user"]->get_table_name() . " u
		    JOIN " . $_DB["room_track"]->get_table_name() . " rt
		      ON rt.creator_user_id = u.id
		    JOIN " . $_DB["track"]->get_table_name() . " t
			 ON rt.youtube_id = t.youtube_id
		   WHERE rt.room_id = ?
		     AND playing_done = 0",
		  $room_id);
    }
}

$_DB["room"] = new DbRoom();

?>
