/* populate table share_status */
INSERT INTO share_status (status) VALUES ('pending');
INSERT INTO share_status (status) VALUES ('provisioning');
INSERT INTO share_status (status) VALUES ('active');
INSERT INTO share_status (status) VALUES ('disabled');
INSERT INTO share_status (status) VALUES ('error');

-- insert one random row into table nfs_exports
INSERT INTO nfs_exports (user_id, status_id, name, desc, path, ro, kerb_auth)
VALUES (
    (SELECT id FROM users WHERE name = 'Superman'), 
    (SELECT id FROM share_status WHERE status = 'active'),
    'my share',
    'used for personal files',
    '/home/superman/personal', 
    false,
    true);
INSERT INTO nfs_exports (user_id, status_id, name, desc, path, ro, kerb_auth)
VALUES (
    (SELECT id FROM users WHERE name = 'Superman'), 
    (SELECT id FROM share_status WHERE status = 'active'),
    'another share',
    'used for TOP SECRET files',
    '/home/superman/secret', 
    true,
    false);
INSERT INTO nfs_exports (user_id, status_id, name, desc, path, ro, kerb_auth)
VALUES (
    (SELECT id FROM users WHERE name = 'Superman'), 
    (SELECT id FROM share_status WHERE status = 'active'),
    'The PUBLIC share',
    'Pulic share',
    '/home/superman/public', 
    false,
    false);

