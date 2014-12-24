define([
    "jquery",
    "utils",
    "playlist",
    "lib/handlebars",
    "websocket_client",
    "lib/bootstrap",
    "lib/jquery-ui",
], function($, Utils, Playlist, Handlebars, WebSocketClient) {
    "use strict";

    var args = {},
	   roomsModalTemplate,
	   usersListTemplate;

    var initTemplates = function() {
	   roomsModalTemplate = Handlebars.compile($("#rooms-modal-template").html());
	   usersListTemplate = Handlebars.compile($("#users-list-template").html());
    };

    var initBindings = function() {
	   $("body").on("click", ".room-row-create", function() {
		  $(".room-row-create-input").removeClass("hidden");
		  $("#room-create-input").focus();
	   });

	   $("body").on("click", ".room-row", function() {
		  initRoom($(this).data("room-id"));
	   });

	   $("body").on("keyup", "#room-create-input", function(event) {
		  if (event.keyCode === 13) {
			 var name = $("#room-create-input").val().trim();
			 if (name === "") {
				alert("Invalid empty room name");
				return;
			 }

			 $.getJSON("json/create_room.php", {
				name       : name,
				session_id : Utils.getCookie("PHPSESSID"),
			 })
			 .success(function(response) {
				initRoom(response.room.id);
			 });
		  }
	   });
    };

    var initRoom = function(roomID) {
	   if (!roomID) {
		  args = Utils.getUrlArguments();
		  roomID = args["room_id"];
	   }

	   if (roomID) {
		  $.getJSON("json/enter_room.php", {
			 session_id : Utils.getCookie("PHPSESSID"),
			 room_id    : roomID
		  })
		  .success(function() {
			 $.getJSON("json/get_room_status.php", {
				    room_id : roomID
			 })
			 .success(function(response) {
				window.config.room = response.room;
				window.location.href = Utils.createUrlFromArguments({
				    room_id : roomID
				});

				var position = 0;

				window.config.room.tracks.forEach(function(track) {
				    track.id = track.youtube_id;
				    track.position = position++;
				    Playlist.append(track);
				});

				window.config.room.users_count = window.config.room.users.length;
				$("#users-container").html(usersListTemplate(window.config.room));
				$("[rel='tooltip']").tooltip();

				$("#rooms-modal").modal("hide");
				$("#panel-container").removeClass("hidden");
			 });
		  });
	   }
    };

    var initRoomsModal = function() {
	   initTemplates();
	   initBindings();
	   $.getJSON("json/get_active_public_rooms.php")
		  .success(function(rooms) {
			 rooms.forEach(function(room) {
				room.online_users = room.users.length + " online users";
			 });

			 $("#rooms-modal-container").html(roomsModalTemplate({ rooms : rooms }));

			 if (!args["room_id"]) {
				$("#rooms-modal").modal({
				    backdrop: "static",
				    keyboard: false,
				});

				$("#rooms-modal").modal("show");
			 }
		  });
    };

    return {
	   initRoom : initRoom,
	   initRoomsModal : initRoomsModal,
    };
});

