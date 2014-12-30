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

	   if (args) {
		  Object.keys(args).forEach(function(key) {
			 if (argString !== "") {
				argString += ";";
			 }

			 argString += key + "=" + args[key];
		  });
	   }

	   var match = window.location.href.match("^(.+)#");
	   var baseUrl = match ? match[1] : window.location.href;
	   return baseUrl + "#" + argString;
    };

    var jsDateToSqlDate = function(date) {
	   return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate()
		  + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    };

    var sqlDateToPrettyDate = function(date) {
	   var match = date.match(/^\s*(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})\s*/)
	   if (!match) {
		  return date;
	   }

	   var year = parseInt(match[1]);
	   var month = parseInt(match[2])-1;
	   var day = parseInt(match[3]);
	   var hour = parseInt(match[4]);
	   var minute = parseInt(match[5]);
	   var second = parseInt(match[6]);
	   date = new Date(year, month, day, hour, minute, second);
	   return date.toDateString() + ", " + date.toLocaleTimeString();
    };

    var getGmtTime = function() {
	   return new Date(new Date().valueOf()
		  + new Date().getTimezoneOffset() * 60 * 1000).getTime();
    };

    return {
	   getCookie : getCookie,
	   getGmtTime : getGmtTime,
	   getUrlArguments : getUrlArguments,
	   createUrlFromArguments : createUrlFromArguments,
	   jsDateToSqlDate : jsDateToSqlDate,
	   sqlDateToPrettyDate : sqlDateToPrettyDate,
    };
});

