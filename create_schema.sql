DROP TABLE IF EXISTS tonlist_user;
CREATE TABLE tonlist_user(
    id int(10) unsigned PRIMARY KEY auto_increment,
    google_id varchar(32) UNIQUE,
    email varchar(255) NOT NULL,
    name varchar(255) NOT NULL,
    given_name varchar(255) NOT NULL,
    picture varchar(255)
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

