DROP TABLE IF EXISTS tonlist_user;
CREATE TABLE tonlist_user(
    id int(10) unsigned PRIMARY KEY auto_increment,
    google_id varchar(32) UNIQUE,
    email varchar(255) NOT NULL,
    name varchar(255) NOT NULL,
    given_name varchar(255) NOT NULL,
    picture varchar(255),
    logged_in tinyint(1) unsigned NOT NULL
);

DROP TABLE IF EXISTS tonlist_user_session;
CREATE TABLE tonlist_user_session(
    session_id varchar(32) PRIMARY KEY,
    access_token text,
    user_id int(10) unsigned,
    created_at timestamp default '0000-00-00 00:00:00',
    last_updated_at timestamp default current_timestamp,

    FOREIGN KEY(user_id) REFERENCES tonlist_user(id)
);

DROP TABLE IF EXISTS tonlist_room;
CREATE TABLE tonlist_room(
    id mediumint(8) unsigned PRIMARY KEY auto_increment,
    name varchar(255) NOT NULL,
    creator_user_id int(10) unsigned,
    created_at timestamp default current_timestamp,
    is_public tinyint(1) unsigned NOT NULL default 1,

    FOREIGN KEY(creator_user_id) REFERENCES tonlist_user(id)
);

DROP TABLE IF EXISTS tonlist_room_history;
CREATE TABLE tonlist_room_history(
    id int(11) unsigned PRIMARY KEY auto_increment,
    room_id mediumint(8) unsigned,
    name varchar(255) NOT NULL,
    creator_user_id int(10) unsigned,
    created_at timestamp default current_timestamp,
    is_public tinyint(1) unsigned NOT NULL default 1,

    KEY(room_id),
    KEY(creator_user_id)
);

DROP TABLE IF EXISTS tonlist_track;
CREATE TABLE tonlist_track(
    youtube_id varchar(32) PRIMARY KEY NOT NULL,
    name varchar(1024) NOT NULL,
    description text,
    image varchar(255),
    created_at timestamp default current_timestamp
);

DROP TABLE IF EXISTS tonlist_room_track;
CREATE TABLE tonlist_room_track(
    id int(11) unsigned PRIMARY KEY auto_increment,
    room_id mediumint(8) unsigned NOT NULL,
    youtube_id varchar(32) NOT NULL,
    creator_user_id int(10) unsigned,
    created_at timestamp default current_timestamp,
    playing tinyint(1) unsigned default 0,
    playing_done tinyint(1) unsigned default 0,

    FOREIGN KEY(creator_user_id) REFERENCES tonlist_user(id),
    FOREIGN KEY(youtube_id) REFERENCES tonlist_track(youtube_id) ON DELETE CASCADE,
    FOREIGN KEY(room_id) REFERENCES tonlist_room(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS tonlist_room_track_history;
CREATE TABLE tonlist_room_track_history(
    id int(11) unsigned PRIMARY KEY auto_increment,
    room_track_id int(11) unsigned NOT NULL,
    room_id mediumint(8) unsigned NOT NULL,
    youtube_id varchar(32) NOT NULL,
    creator_user_id int(10) unsigned,
    created_at timestamp default current_timestamp,

    KEY(room_track_id),
    KEY(creator_user_id),
    KEY(youtube_id),
    KEY(room_id)
);

DROP TABLE IF EXISTS tonlist_user_room;
CREATE TABLE tonlist_user_room(
    user_id int(10) unsigned,
    room_id mediumint(8) unsigned,
    last_updated_at timestamp default current_timestamp,

    PRIMARY KEY(user_id, room_id),
    FOREIGN KEY(user_id) REFERENCES tonlist_user(id),
    FOREIGN KEY(room_id) REFERENCES tonlist_room(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS tonlist_user_room_history;
CREATE TABLE tonlist_user_room_history(
    id int(11) unsigned PRIMARY KEY auto_increment,
    user_id int(10) unsigned,
    room_id mediumint(8) unsigned,
    created_at timestamp default current_timestamp,

    KEY(user_id),
    KEY(room_id)
);

