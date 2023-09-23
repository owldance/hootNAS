/* add admins, users, data-admins, backup-admins to table groups */
INSERT INTO "groups" ("group") VALUES ('admins');
INSERT INTO "groups" ("group") VALUES ('users');
INSERT INTO "groups" ("group") VALUES ('data-admins');
INSERT INTO "groups" ("group") VALUES ('backup-admins');

/* add active, inactive, locked to table status */
INSERT INTO "user_status" ("status") VALUES ('active');
INSERT INTO "user_status" ("status") VALUES ('inactive');
INSERT INTO "user_status" ("status") VALUES ('locked');


/* create 4 random users */
INSERT INTO "users" ("name", "mail", "password") 
VALUES ('Superman', 'super@man.me', 'kryp2Nite');
INSERT INTO "users" ("name", "mail", "password") 
VALUES ('OneTimeUser', 'one@time.user', 'Zn05z1mfk7y');
INSERT INTO "users" ("name", "mail", "password") 
VALUES ('DonkeyKong', 'donkey@kong.om', 'Donk3yK0ng');

/* assign users a new status */
UPDATE users 
SET status_id = (SELECT id FROM user_status WHERE status = 'active')
WHERE name = 'Superman';
UPDATE users 
SET status_id = (SELECT id FROM user_status WHERE status = 'active') 
WHERE name = 'DonkeyKong';
UPDATE users 
SET status_id = (SELECT id FROM user_status WHERE status = 'active') 
WHERE name = 'OneTimeUser';
UPDATE users 
SET status_id = (SELECT id FROM user_status WHERE status = 'inactive') 
WHERE name = 'Funky';

/* a user, MUST at least be member of the group user */
/* insert into user_groups using "name" and "group" */
/* superman */
INSERT INTO "user_groups" ("user_id", "group_id") 
VALUES (
    (SELECT id FROM users WHERE "name" = 'Superman'), 
    (SELECT id FROM groups WHERE "group" = 'admins'));
INSERT INTO "user_groups" ("user_id", "group_id") 
VALUES (
    (SELECT id FROM users WHERE "name" = 'Superman'), 
    (SELECT id FROM groups WHERE "group" = 'users'));

INSERT INTO "user_groups" ("user_id", "group_id") 
VALUES (
    (SELECT id FROM users WHERE "name" = 'Superman'), 
    (SELECT id FROM groups WHERE "group" = 'admins'));
INSERT INTO "user_groups" ("user_id", "group_id") 
VALUES (
    (SELECT id FROM users WHERE "name" = 'Superman'), 
    (SELECT id FROM groups WHERE "group" = 'data-admins'));
/* OneTimeUser */
INSERT INTO "user_groups" ("user_id", "group_id") 
VALUES (
    (SELECT id FROM users WHERE "name" = 'OneTimeUser'), 
    (SELECT id FROM groups WHERE "group" = 'users'));

INSERT INTO "user_groups" ("user_id", "group_id") 
VALUES (
    (SELECT id FROM users WHERE "name" = 'OneTimeUser'), 
    (SELECT id FROM groups WHERE "group" = 'admins'));
INSERT INTO "user_groups" ("user_id", "group_id") 
VALUES (
    (SELECT id FROM users WHERE "name" = 'OneTimeUser'), 
    (SELECT id FROM groups WHERE "group" = 'data-admins'));
/* DonkeyKong */
INSERT INTO "user_groups" ("user_id", "group_id") 
VALUES (
    (SELECT id FROM users WHERE "name" = 'DonkeyKong'), 
    (SELECT id FROM groups WHERE "group" = 'users'));

INSERT INTO "user_groups" ("user_id", "group_id") 
VALUES (
    (SELECT id FROM users WHERE "name" = 'DonkeyKong'), 
    (SELECT id FROM groups WHERE "group" = 'users'));


