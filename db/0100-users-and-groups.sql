/*
sqlite3 
create tables for hoot.db 
*/

/* create users table */ 
CREATE TABLE IF NOT EXISTS "users" (
    "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    "name"	TEXT NOT NULL UNIQUE,
    "mail"	TEXT NOT NULL UNIQUE,
    "password"	TEXT NOT NULL,
    "status_id"	NOT NULL DEFAULT 1
);

/* create table for groups */
CREATE TABLE IF NOT EXISTS "groups" (
    "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    "group"	TEXT NOT NULL
);

/* create table for user_groups */
CREATE TABLE IF NOT EXISTS "user_groups" (
    "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    "user_id"	INTEGER NOT NULL,
    "group_id"	INTEGER NOT NULL,
    FOREIGN KEY("user_id") REFERENCES "users"("id"),
    FOREIGN KEY("group_id") REFERENCES "groups"("id")
);

/* create table user_status */
CREATE TABLE IF NOT EXISTS "user_status" (
    "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    "status"	TEXT NOT NULL
);
