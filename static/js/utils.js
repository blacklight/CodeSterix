define("utils", [
    "jquery",
], function($) {
    "use strict";

    var getCookie = function(name) {
	   var value = "; " + document.cookie;
	   var parts = value.split("; " + name + "=");
	   if (parts.length == 2) return parts.pop().split(";").shift();
    };

    return {
	   getCookie : getCookie,
    };
});
