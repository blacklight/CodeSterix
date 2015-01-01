// Google sign-in
var signinCallback = function(authResult) {
    if (authResult.status.signed_in && authResult.access_token) {
	   var curDate = new Date();
	   var expireDate = new Date(curDate.getFullYear()+1, curDate.getMonth(), curDate.getDate());
	   document.cookie = "access_token=" + authResult.access_token + "; expires=" + expireDate.toUTCString() + "; path=/";
	   document.cookie = "auth_type_id=1; expires=" + expireDate.toUTCString() + "; path=/";

	   $.getJSON("https://www.googleapis.com/oauth2/v2/userinfo", {
		   alt: "json",
		   access_token: authResult.access_token,
	   })
		   .success(function(result) {
			  window.location = "index.php";
		   });
    }
};

// Facebook sign-in
var statusChangeCallback = function(response) {
    if (response.status !== 'connected') {
	   return;
    }

    var curDate = new Date();
    var expireDate = new Date(curDate.getFullYear()+1, curDate.getMonth(), curDate.getDate());
    document.cookie = "access_token=" + response.authResponse.accessToken + "; expires=" + expireDate.toUTCString() + "; path=/";
    document.cookie = "auth_type_id=2; expires=" + expireDate.toUTCString() + "; path=/";
    window.location = "index.php";
};

var checkLoginState = function() {
    FB.getLoginStatus(function(response) {
	   statusChangeCallback(response);
    });
};

window.fbAsyncInit = function() {
    FB.init({
	   appId   : '780220522015442',
	   xfbml   : true,
	   version : 'v2.2'
    });

    FB.getLoginStatus(function(response) {
	   statusChangeCallback(response);
    });
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

