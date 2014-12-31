<?php

require_once "db.php";

class DbAuthType extends Db {
    protected $table_name = "tonlist_auth_type";
    protected $columns = array(
	   "id",
	   "name",
    );

    const GOOGLE_AUTH_TYPE_ID = 1;
    const FACEBOOK_AUTH_TYPE_ID = 2;
}

?>
