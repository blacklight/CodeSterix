<?php

require_once "db.php";

class DbTrack extends Db {
    protected $table_name = "tonlist_track";
    protected $columns = array(
	   "youtube_id",
	   "name",
	   "description",
	   "duration",
	   "image",
	   "created_at",
    );

    protected $primary_key = "youtube_id";
}

$_DB["track"] = new DbTrack();

?>
