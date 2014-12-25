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

    public function create_track($args) {
	   $this->query("INSERT INTO " . $this->table
		  . "(youtube_id, name, description, duration, image) VALUES "
		  . "(?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE " . $this->table
		  . " SET name = ?, description = ?, duration = ?, image = ?",
		  $args["youtube_id"], $args["name"], $args["description"],
		  $args["duration"], $args["image"],
		  $args["name"], $args["description"],
		  $args["duration"], $args["image"]);

	   $ret = $this->query("SELECT * FROM $this->table_name WHERE youtube_id = " . $args["youtube_id"]);
	   if (isset($ret) && $ret) {
		  return $ret->fetchObject();
	   }
    }
}

$_DB["track"] = new DbTrack();

?>
