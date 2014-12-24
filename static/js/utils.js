define("utils", [
    "jquery",
], function($) {
    "use strict";

    var getCookie = function(name) {
	   var value = "; " + document.cookie;
	   var parts = value.split("; " + name + "=");
	   if (parts.length == 2) return parts.pop().split(";").shift();
    };

    var getUrlArguments = function() {
	   var m = window.location.href.match(/#(.*)$/);
	   if (!m) {
		  return {};
	   }

	   var args = {};
	   m[1].split(/;/).forEach(function(arg) {
		  var mm = arg.match(/(.+)=(.+)/);
		  if (mm) {
			 args[mm[1]] = mm[2];
		  }
	   });

	   return args;
    };

    var createUrlFromArguments = function(args) {
	   var argString = "";

	   Object.keys(args).forEach(function(key) {
		  if (argString !== "") {
			 argString += ";";
		  }

		  argString += key + "=" + args[key];
	   });

	   var match = window.location.href.match("^(.+)#");
	   var baseUrl = match ? match[1] : window.location.href;
	   return baseUrl + "#" + argString;
    };

    return {
	   getCookie : getCookie,
	   getUrlArguments : getUrlArguments,
	   createUrlFromArguments : createUrlFromArguments,
    };
});

