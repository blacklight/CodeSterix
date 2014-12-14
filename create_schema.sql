DROP TABLE IF EXISTS tonlist_user;
CREATE TABLE tonlist_user(
    id int(10) unsigned PRIMARY KEY auto_increment,
    google_id varchar(32) UNIQUE,
    email varchar(255) NOT NULL,
    name varchar(255) NOT NULL,
    given_name varchar(255) NOT NULL,
    picture varchar(255)
);

