define([
    "jquery",
    "utils",
    "lib/handlebars",
    "protocol",
    "websocket_client",
    "lib/bootstrap",
], function($, Utils, Handlebars, Protocol, WebSocketClient) {
    "use strict";

    var eventWindowTemplate,
	   eventWindowEmptyTemplate,
	   msgEventTemplate,
	   genericEventTemplate;

    var initTemplates = function() {
	   eventWindowTemplate = Handlebars.compile($("#event-window-template").html());
	   eventWindowEmptyTemplate = Handlebars.compile($("#event-window-empty-template").html());
	   genericEventTemplate = Handlebars.compile($("#generic-event-template").html());
	   msgEventTemplate = Handlebars.compile($("#msg-event-template").html());
    };

    var initElements = function() {
	   $("#event-window").html(eventWindowTemplate);
	   $("#event-window-content").html(eventWindowEmptyTemplate);
	   $(".event-window-empty").removeClass("hidden");
    };

    var initBindings = function() {
	   $(".chat-line").on("keyup", function(event) {
		  if (event.keyCode === 13) {
			 var msg = $(this).val().trim();
			 $(this).val("");
			 if (msg === "") {
				return;
			 }

			 WebSocketClient.send({
				msgType: Protocol.MessageTypes.CHAT_MSG,
				payload: {
				    roomID  : window.config.room.id,
				    message : msg,
				}
			 });
		  }
	   });
    };

    var initEventWindow = function() {
	   initTemplates();
	   initElements();
	   initBindings();
    };

    var addEvent = function(event) {
	   $(".event-window-empty").addClass("hidden");
	   event.timestamp = new Date().toLocaleTimeString();

	   switch(event.type) {
		  case Protocol.Events.USER_CONNECT:
			 event.userConnect = true;
			 $("#event-window-content").append(genericEventTemplate(event));
			 break;

		  case Protocol.Events.USER_DISCONNECT:
			 event.userDisconnect = true;
			 $("#event-window-content").append(genericEventTemplate(event));
			 break;

		  case Protocol.Events.ROOM_MSG:
			 if (event.user.id == window.config.user.id) {
				event.isMine = true;
			 }

			 $("#event-window-content").append(msgEventTemplate(event));
			 break;
	   }

	   $("#event-window-content").animate({
		  scrollTop: $("#event-window-content")[0].scrollHeight
	   }, 1000);
    };

    return {
	   addEvent: addEvent,
	   initEventWindow: initEventWindow,
    };
});

