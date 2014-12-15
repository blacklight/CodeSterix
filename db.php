<?php

require_once "conf.php";

class Db extends PDO {
    public function __construct($options=null) {
	   parent::__construct(
		  'mysql:host=' . DB_HOST .
		  ';port=' . DB_PORT .
		  ';dbname=' . DB_NAME,
		  DB_USER,
		  DB_PASS,
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
		  isset($user->google_id) ? $user->google_id : null,
		  isset($user->email) ? $user->email : null,
		  isset($user->name) ? $user->name : null,
		  isset($user->given_name) ? $user->given_name : null,
		  isset($user->picture) ? $user->picture : null
	   );
    }
}

$db = new Db();

?>
