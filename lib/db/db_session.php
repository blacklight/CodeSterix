<?php

require_once "db.php";

class DbUserSession extends Db {
    protected $table_name = "tonlist_user_session";
    protected $columns = array(
	   "session_id",
	   "access_token",
	   "user_id",
	   "created_at",
	   "last_updated_at",
    );

    protected $primary_key = "session_id";

    public function store_session($args) {
	   return parent::query("INSERT INTO $this->table_name"
		  . "(session_id, access_token, user_id, created_at) "
		  . "VALUES(?, ?, ?, CURRENT_TIMESTAMP) "
		  . "ON DUPLICATE KEY "
		  . "UPDATE last_updated_at = CURRENT_TIMESTAMP",
		  $args["session_id"],
		  $args["access_token"],
		  $args["user_id"]
	   );
    }
}

$_DB["user_session"] = new DbUserSession();

?>
