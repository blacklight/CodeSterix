<?php

require_once "conf.php";
require_once TONLIST_PATH . "/lib/db/db_auth_type.php";
require_once TONLIST_PATH . "/lib/db/db_user.php";
require_once TONLIST_PATH . "/lib/db/db_session.php";

session_start();

if (isset($_COOKIE["access_token"]) && !isset($_SESSION["access_token"])) {
    $_SESSION["access_token"] = $_COOKIE["access_token"];
}

if (isset($_SESSION["access_token"]) && !isset($_COOKIE["access_token"])) {
    setcookie("access_token", $_SESSION["access_token"], time() + 60*60*24*365);
}

if (isset($_SESSION["user"])) {
    $user = $_SESSION["user"];
}

if ((!isset($user) || !$user) && isset($_SESSION["access_token"])) {
    $token = $_SESSION["access_token"];

    $params = array(
	   "alt" => "json",
	   "access_token" => $token,
    );

    if ($_COOKIE["auth_type_id"] == DbAuthType::GOOGLE_AUTH_TYPE_ID) {
	   $userinfo = file_get_contents("https://www.googleapis.com/oauth2/v2/userinfo?" . http_build_query($params));

	   if ($userinfo) {
		  $userinfo = json_decode($userinfo);
		  $user = $_DB["user"]->search_where(array(
			 "google_id" => $userinfo->id
		  ));

		  if ($user) {
			 $user = $user->fetchObject();
		  }

		  if (!$user) {
			 $user = $_DB["user"]->insert(array(
				"google_id"    => $userinfo->id,
				"email"        => $userinfo->email,
				"name"         => $userinfo->name,
				"given_name"   => $userinfo->given_name,
				"picture"      => $userinfo->picture,
				"auth_type_id" => DbAuthType::GOOGLE_AUTH_TYPE_ID,
			 ));
		  }

		  $_SESSION["user"] = $user;
	   } else {
		  setcookie("access_token", null, -1);
		  unset($_SESSION["access_token"]);
	   }
    } elseif ($_COOKIE["auth_type_id"] == DbAuthType::FACEBOOK_AUTH_TYPE_ID) {
	   $userinfo = file_get_contents("https://graph.facebook.com/me?" . http_build_query($params));

	   if ($userinfo) {
		  $userinfo = json_decode($userinfo);
		  $user = $_DB["user"]->search_where(array(
			 "facebook_id" => $userinfo->id
		  ));

		  if ($user) {
			 $user = $user->fetchObject();
		  }

		  if (!$user) {
			 $user = $_DB["user"]->insert(array(
				"facebook_id"  => $userinfo->id,
				"email"        => $userinfo->email,
				"name"         => $userinfo->name,
				"given_name"   => $userinfo->first_name,
				"picture"      => "https://graph.facebook.com/" . $userinfo->id . "/picture",
				"auth_type_id" => DbAuthType::FACEBOOK_AUTH_TYPE_ID,
			 ));
		  }

		  $_SESSION["user"] = $user;
	   } else {
		  setcookie("access_token", null, -1);
		  unset($_SESSION["access_token"]);
	   }
    }
}

if (isset($user) && $user) {
    $_DB["user_session"]->store_session(array(
	   "session_id"   => $_COOKIE["PHPSESSID"],
	   "access_token" => $_COOKIE["access_token"],
	   "user_id"      => $user->id,
    ));
?>

    <script>
	   window.config = window.config || {};
	   window.config.user = {};
	   window.config.user.id = <?php echo $user->id ?>;
	   window.config.user.name = "<?php echo $user->name ?>";
	   window.config.user.givenName = "<?php echo $user->given_name ?>";
	   window.config.user.email = "<?php echo $user->email ?>";
	   window.config.user.picture = "<?php echo $user->picture ?>";
    </script>

<?php
} else if (!preg_match("#" . LOGIN_URI . "$#", $_SERVER["PHP_SELF"])) {
    header("Location: " . LOGIN_URI);
}
?>
