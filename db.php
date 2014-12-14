<?php

class Db extends PDO {
    const DB_HOST = "localhost";
    const DB_PORT = 3306;
    const DB_USER = "root";
    const DB_PASS = "";
    const DB_NAME = "tonlist";

    public function __construct($options=null) {
	   parent::__construct(
		  'mysql:host=' .Db::DB_HOST .
		  ';port=' .Db::DB_PORT .
		  ';dbname=' . Db::DB_NAME,
		  Db::DB_USER,
		  Db::DB_PASS,
		  $options);
    }

    public function query($query) {
	   $args = func_get_args();
	   array_shift($args);
	   $response = parent::prepare($query);
	   $response->execute($args);

	   return $response;
    }

    public function get_user($id) {
	   $user = $this->query("SELECT * FROM tonlist_user WHERE id = ?", $id);
	   $user = $user->fetchObject();
	   if (!$user) {
		  $user = $this->query("SELECT * FROM tonlist_user WHERE google_id = ?", $id);
		  $user = $user->fetchObject();
	   }

	   return $user;
    }

    public function create_user($user) {
	   $this->query("INSERT INTO tonlist_user(google_id, email, name, given_name, picture) VALUES(?, ?, ?, ?, ?)",
		  $user->google_id,
		  $user->email,
		  $user->name,
		  $user->given_name,
		  $user->picture
	   );
    }
}

$db = new Db();

?>
