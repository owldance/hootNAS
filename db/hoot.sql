/*
sqlite3 
create tables for hoot.db 
*/

/* create users table */ 
CREATE TABLE IF NOT EXISTS "users" (
    "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    "name"	TEXT NOT NULL,
    "mail"	TEXT NOT NULL,
    "password"	TEXT NOT NULL
);

/* create table for groups */
CREATE TABLE IF NOT EXISTS "groups" (
    "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    "group"	TEXT NOT NULL
);

/* add admins, users, data-admins, backup-admins to table groups */
INSERT INTO "groups" ("group") VALUES ('admins');
INSERT INTO "groups" ("group") VALUES ('users');
INSERT INTO "groups" ("group") VALUES ('data-admins');
INSERT INTO "groups" ("group") VALUES ('backup-admins');
/* create table for user_groups */
CREATE TABLE IF NOT EXISTS "user_groups" (
    "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    "user_id"	INTEGER NOT NULL,
    "group_id"	INTEGER NOT NULL,
    FOREIGN KEY("user_id") REFERENCES "users"("id"),
    FOREIGN KEY("group_id") REFERENCES "groups"("id")
);
/* create 3 random users */
INSERT INTO "users" ("name", "mail", "password") 
VALUES ('Monkey', 'monkey@mail.me', 'monk7y');
INSERT INTO "users" ("name", "mail", "password") 
VALUES ('Donkey', 'donkey@kong.om', 'donk3y');
INSERT INTO "users" ("name", "mail", "password") 
VALUES ('Mario', 'mario@brothers.io', 'mar10');
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
/* mario */
INSERT INTO "user_groups" ("user_id", "group_id") 
VALUES (
    (SELECT id FROM users WHERE "name" = 'Mario'), 
    (SELECT id FROM groups WHERE "group" = 'users'));

INSERT INTO "user_groups" ("user_id", "group_id") 
VALUES (
    (SELECT id FROM users WHERE "name" = 'Mario'), 
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

/* select user and group membership, by name and password */
SELECT users.name, groups."group"
FROM users
INNER JOIN user_groups ON users.id = user_groups.user_id 
INNER JOIN groups ON user_groups.group_id = groups.id 
WHERE name ='Monkey' AND password='Monk7y';

