<?php

class Db extends PDO {
    protected $table_name;
    protected $columns = array();
    protected $primary_key = null;

    public function __construct($options=null) {
	   parent::__construct(
		  'mysql:host=' . DB_HOST .
		  ';port=' . DB_PORT .
		  ';dbname=' . DB_NAME,
		  DB_USER,
		  DB_PASS,
		  $options);

	   parent::setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function retrieve($key) {
	   if (is_array($key)) {
		  if (count($key) == 0) {
			 die ("Invalid 0-length array value for the key");
		  }

		  if (!is_array($this->primary_key)) {
			 $key = $key[0];
		  } elseif (count($this->primary_key) != count($key)) {
			 die ("The length of the key parameter (" . count($key) . ") is different from the length of the configured table key (" . count($this->primary_key) . ")");
		  }

		  $condition = array();
		  $values = array();

		  while (list($field, $value) = each($key)) {
			 array_push($condition, "$field = ?");
			 array_push($values, $value);
		  }

		  $condition = join(" AND ", $condition);

		  $args = array();
		  array_push($args, "SELECT * FROM $this->table_name WHERE $condition");
		  foreach ($values as $value) {
			 array_push($args, $value);
		  }

		  $result = call_user_func_array(array($this, "query"), $args);
		  return $result ? $result->fetchObject() : null;
	   } else {
		  $primary_key = $this->primary_key;
		  if (is_array($primary_key)) {
			 if (count($primary_key) != 1) {
				die ("Single value passed as key value for a table having a key with " . count($primary_key) . " columns");
			 } else {
				$primary_key = $primary_key[0];
			 }
		  }

		  $result = $this->query("SELECT * FROM $this->table_name WHERE $primary_key = ?", $key);
		  return $result ? $result->fetchObject() : null;
	   }
    }

    public function search_where($pairs) {
	   $condition = array();
	   $values = array();

	   while (list($field, $value) = each($pairs)) {
		  array_push($condition, "$field = ?");
		  array_push($values, $value);
	   }

	   $condition = join(" AND ", $condition);

	   $args = array();
	   array_push($args, "SELECT * FROM $this->table_name WHERE $condition");
	   foreach ($values as $value) {
		  array_push($args, $value);
	   }

	   $result = call_user_func_array(array($this, "query"), $args);
	   return $result;
    }

    public function query($query) {
	   $args = func_get_args();
	   array_shift($args);
	   $response = parent::prepare($query);
	   $ret = $response->execute($args);

	   return $response;
    }

    public function insert($tuple) {
	   $columns = array();
	   $values = array();
	   $placeholders = array();

	   while (list($field, $value) = each($tuple)) {
		  array_push($columns, $field);
		  array_push($values, $value);
		  array_push($placeholders, "?");
	   }

	   $columns = join(", ", $columns);
	   $placeholders = join(", ", $placeholders);

	   $args = array();
	   array_push($args, "INSERT INTO $this->table_name($columns) VALUES($placeholders)");
	   foreach ($values as $value) {
		  array_push($args, $value);
	   }

	   $ret = call_user_func_array(array($this, "query"), $args);

	   if (is_array($this->primary_key) && count($this->primary_key) == 1) {
		  $key = $this->primary_key[0];
	   } elseif (!is_array($this->primary_key)) {
		  $key = $this->primary_key;
	   }

	   if (isset($key)) {
		  $ret = $this->query("SELECT * FROM $this->table_name WHERE $key = LAST_INSERT_ID()");
		  if (isset($ret) && $ret) {
			 return $ret->fetchObject();
		  }
	   } else {
		  return $ret;
	   }
    }
}

?>
