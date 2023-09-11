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

/* select nfs exports for user Superman */
SELECT nfs_exports.*
FROM nfs_exports
INNER JOIN users ON nfs_exports.user_id = users.id
WHERE users.name = 'Superman';

/* update nfs export with random new path and sync for user Superman   */
UPDATE nfs_exports
SET path = '/mnt/backup', sync = 0
WHERE id = 1;



