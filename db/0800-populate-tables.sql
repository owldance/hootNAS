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
VALUES ('Monkey', 'monkey@mail.me', 'monk7y');
INSERT INTO "users" ("name", "mail", "password") 
VALUES ('Donkey', 'donkey@kong.om', 'donk3y');
INSERT INTO "users" ("name", "mail", "password") 
VALUES ('Funky', 'funky@brothers.io', 'funke4');

/* assign users a new status */
UPDATE users 
SET status_id = (SELECT id FROM user_status WHERE status = 'active')
WHERE name = 'Superman';
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

/* insert random nfs export for user Superman into table nfs_exports */
INSERT INTO "nfs_exports" ("user_id", "name", "desc", "path", "sec", "ro", 
    "sync", "wdelay", "hide", "crossmnt", "subtree_check", "secure_locks", 
    "mountpoint", "fsid", "nordirplus", "refer", "replicas", "pnfs", 
    "security_label", "root_squash", "all_squash", "anonuid", "anongid")
VALUES (
    (SELECT id FROM users WHERE "name" = 'Superman'), 
    'my share',
    'used for personal files',
    '/home/superman/personal', 
    'krb5',
    1,1,1,1,1,0,1,NULL,NULL,0,NULL,NULL,0,0,1,0,NULL,NULL);
INSERT INTO "nfs_exports" ("user_id", "name", "desc", "path", "sec", "ro", 
    "sync", "wdelay", "hide", "crossmnt", "subtree_check", "secure_locks", 
    "mountpoint", "fsid", "nordirplus", "refer", "replicas", "pnfs", 
    "security_label", "root_squash", "all_squash", "anonuid", "anongid")
VALUES (
    (SELECT id FROM users WHERE "name" = 'Superman'), 
    'another share',
    'used for TOP SECRET files',
    '/home/superman/secret', 
    'krb5p',
    1,1,1,1,1,0,1,NULL,NULL,0,NULL,NULL,0,0,1,0,NULL,NULL);
INSERT INTO "nfs_exports" ("user_id", "name", "desc", "path", "sec", "ro", 
    "sync", "wdelay", "hide", "crossmnt", "subtree_check", "secure_locks", 
    "mountpoint", "fsid", "nordirplus", "refer", "replicas", "pnfs", 
    "security_label", "root_squash", "all_squash", "anonuid", "anongid")
VALUES (
    (SELECT id FROM users WHERE "name" = 'Superman'), 
    'The THIRD share',
    'Pulic share',
    '/home/superman/public', 
    'krb5p',
    1,FALSE,1,1,1,0,1,NULL,NULL,0,NULL,NULL,0,0,1,0,NULL,NULL);
