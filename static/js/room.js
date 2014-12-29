define([
    "jquery",
    "utils",
    "playlist",
    "lib/handlebars",
    "protocol",
    "websocket_client",
    "lib/bootstrap",
    "lib/jquery-ui",
], function($, Utils, Playlist, Handlebars, Protocol, WebSocketClient) {
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

	   $("body").on("click", "#rooms-modal-show", function() {
		  refreshRoomsModal({ forceShow: true });
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
			 })
			 .success(function(response) {
				initRoom(response.room.id);
			 });
		  }
	   });
    };

    var initRoom = function(roomID, opts) {
	   if (!roomID) {
		  args = Utils.getUrlArguments();
		  roomID = args["room_id"];
	   }

	   if (roomID) {
		  $.getJSON("json/enter_room.php", {
			 room_id    : roomID
		  })
		  .success(function() {
			 WebSocketClient.send({
				msgType : Protocol.MessageTypes.ROOM_REGISTRATION,
				payload : {
				    roomID : roomID,
				}
			 });

			 if (!opts) {
				opts = {};
			 }

			 opts.init = true;
			 updateRoom(roomID, opts);
		  })
		  .error(function() {
			 $("#rooms-modal").modal("show");
			 window.location.href = Utils.createUrlFromArguments();
		  });
	   }
    };

    var updateRoom = function(roomID, opts) {
	   $.getJSON("json/get_room_status.php", {
		  room_id : roomID
	   })
	   .success(function(response) {
		  window.config.room = response.room;
		  window.location.href = Utils.createUrlFromArguments({
			 room_id : roomID
		  });

		  var position = 0;

		  if (!opts || (opts && !opts.onlyUsersList)) {
			 Playlist.clear();
			 if (opts && opts.init) {
				// require("player").reset();
			 }

			 window.config.room.tracks.forEach(function(track) {
				track.position = position++;
				Playlist.append(track, { onlyAppend: (opts && opts.init ? true : false) });
			 });
		  }

		  if (!opts || (opts && !opts.onlyPlayList)) {
			 window.config.room.created_at = Utils.sqlDateToPrettyDate(window.config.room.created_at);
			 window.config.room.users_count = window.config.room.users.length;
			 window.config.room.users.forEach(function(user) {
				user.connected_since = Utils.sqlDateToPrettyDate(user.connected_since);
			 });

			 $("#users-container").html(usersListTemplate(window.config.room));
			 $("[rel='tooltip']").tooltip();
		  }

		  $("#rooms-modal").modal("hide");
		  $("#panel-container").removeClass("hidden");
	   });
    };

    var initRoomsModal = function() {
	   initTemplates();
	   initBindings();
	   refreshRoomsModal();
    };

    var refreshRoomsModal = function(opts) {
	   $.getJSON("json/get_active_public_rooms.php")
		  .success(function(rooms) {
			 rooms.sort(function(a, b) { return a.online_users < b.online_users; });
			 rooms.forEach(function(room) {
				room.online_users = room.users.length;
				room.created_at = Utils.sqlDateToPrettyDate(room.created_at);
				room.n_tracks = room.tracks.length;
			 });

			 $("#rooms-modal-container").html(roomsModalTemplate({ rooms : rooms }));

			 if (!args["room_id"] || (opts && opts.forceShow)) {
				if (!args["room_id"]) {
				    $("#rooms-modal").modal({
					   backdrop: "static",
					   keyboard: false,
				    });
				}

				$("#rooms-modal").modal("show");
			 }
		  });
    };

    return {
	   initRoom : initRoom,
	   updateRoom : updateRoom,
	   initRoomsModal : initRoomsModal,
    };
});

