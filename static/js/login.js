var signinCallback = function(authResult) {
    if (authResult.status.signed_in && authResult.access_token) {
	   var curDate = new Date();
	   var expireDate = new Date(curDate.getFullYear()+1, curDate.getMonth(), curDate.getDate());
	   document.cookie = "access_token=" + authResult.access_token + "; expires=" + expireDate.toUTCString() + "; path=/";

	   $.getJSON("https://www.googleapis.com/oauth2/v2/userinfo", {
		   alt: "json",
		   access_token: authResult.access_token,
	   })
		   .success(function(result) {
			   window.location = "index.php";
		   });
    }
};

