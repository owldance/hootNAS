/*
sqlite3 
create tables for hoot.db 
*/

/* create users table */ 
CREATE TABLE IF NOT EXISTS "users" (
    "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    "name"	TEXT NOT NULL,
    "mail"	TEXT NOT NULL,
    "password"	TEXT NOT NULL,
    "status_id"	DEFAULT 1
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

/* add admins, users, data-admins, backup-admins to table groups */
INSERT INTO "groups" ("group") VALUES ('admins');
INSERT INTO "groups" ("group") VALUES ('users');
INSERT INTO "groups" ("group") VALUES ('data-admins');
INSERT INTO "groups" ("group") VALUES ('backup-admins');

/* add active, inactive, locked to table status */
INSERT INTO "user_status" ("status") VALUES ('active');
INSERT INTO "user_status" ("status") VALUES ('inactive');
INSERT INTO "user_status" ("status") VALUES ('locked');



/* create 3 random users */
INSERT INTO "users" ("name", "mail", "password") 
VALUES ('Monkey', 'monkey@mail.me', 'monk7y');
INSERT INTO "users" ("name", "mail", "password") 
VALUES ('Donkey', 'donkey@kong.om', 'donk3y');
INSERT INTO "users" ("name", "mail", "password") 
VALUES ('Funky', 'funky@brothers.io', 'funke4');

/* assign users a new status */
UPDATE users 
SET status_id = (SELECT id FROM user_status WHERE status = 'active') 
WHERE name = 'Donkey';
UPDATE users 
SET status_id = (SELECT id FROM user_status WHERE status = 'active') 
WHERE name = 'Monkey';
UPDATE users 
SET status_id = (SELECT id FROM user_status WHERE status = 'inactive') 
WHERE name = 'Funky';

/* a user, MUST at least be member of the group user */
/* insert into user_groups using "name" and "group" */
/* mokey */
INSERT INTO "user_groups" ("user_id", "group_id") 
VALUES (
    (SELECT id FROM users WHERE "name" = 'Monkey'), 
    (SELECT id FROM groups WHERE "group" = 'users'));

INSERT INTO "user_groups" ("user_id", "group_id") 
VALUES (
    (SELECT id FROM users WHERE "name" = 'Monkey'), 
    (SELECT id FROM groups WHERE "group" = 'admins'));

INSERT INTO "user_groups" ("user_id", "group_id") 
VALUES (
    (SELECT id FROM users WHERE "name" = 'Monkey'), 
    (SELECT id FROM groups WHERE "group" = 'data-admins'));
/* donkey */
INSERT INTO "user_groups" ("user_id", "group_id") 
VALUES (
    (SELECT id FROM users WHERE "name" = 'Donkey'), 
    (SELECT id FROM groups WHERE "group" = 'users'));

INSERT INTO "user_groups" ("user_id", "group_id") 
VALUES (
    (SELECT id FROM users WHERE "name" = 'Donkey'), 
    (SELECT id FROM groups WHERE "group" = 'users'));
/* Funky */
INSERT INTO "user_groups" ("user_id", "group_id") 
VALUES (
    (SELECT id FROM users WHERE "name" = 'Funky'), 
    (SELECT id FROM groups WHERE "group" = 'users'));

INSERT INTO "user_groups" ("user_id", "group_id") 
VALUES (
    (SELECT id FROM users WHERE "name" = 'Funky'), 
    (SELECT id FROM groups WHERE "group" = 'backup-admins'));

/* list all tables */
SELECT name FROM sqlite_master WHERE type='table';

/* list all columns in table */
PRAGMA table_info(users);

/* list all users' and their group membership, order by name ascending */
SELECT users.name, groups."group" 
FROM users 
INNER JOIN user_groups ON users.id = user_groups.user_id 
INNER JOIN groups ON user_groups.group_id = groups.id 
ORDER BY users.name ASC;

/* select user name, status and group membership, by name and password */
SELECT users.*, user_status.status, groups."group"
FROM users
INNER JOIN user_groups ON users.id = user_groups.user_id
INNER JOIN groups ON user_groups.group_id = groups.id
INNER JOIN user_status ON users.status_id = user_status.id
WHERE name ='Monkey' AND password='monk7y';

