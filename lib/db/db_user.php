<?php

require_once "db.php";

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
}

?>
