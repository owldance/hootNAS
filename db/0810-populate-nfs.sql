/* populate table export_status */
INSERT INTO export_status (status) VALUES ('pending');
INSERT INTO export_status (status) VALUES ('provisioning');
INSERT INTO export_status (status) VALUES ('enabled');
INSERT INTO export_status (status) VALUES ('disabled');
INSERT INTO export_status (status) VALUES ('error');
INSERT INTO export_status (status) VALUES ('deleted');

-- insert one random row into table nfs_exports
INSERT INTO nfs_exports (user_id, status_id, name, desc, path, ro, kerb_auth)
VALUES (
    (SELECT id FROM users WHERE name = 'Superman'), 
    (SELECT id FROM export_status WHERE status = 'enabled'),
    'my share',
    'used for personal files',
    '/home/superman/personal', 
    false,
    true);
INSERT INTO nfs_exports (user_id, status_id, name, desc, path, ro, kerb_auth)
VALUES (
    (SELECT id FROM users WHERE name = 'Superman'), 
    (SELECT id FROM export_status WHERE status = 'enabled'),
    'another share',
    'used for TOP SECRET files',
    '/home/superman/secret', 
    true,
    false);
INSERT INTO nfs_exports (user_id, status_id, name, desc, path, ro, kerb_auth)
VALUES (
    (SELECT id FROM users WHERE name = 'Superman'), 
    (SELECT id FROM export_status WHERE status = 'enabled'),
    'The PUBLIC share',
    'Public share',
    '/home/superman/public', 
    false,
    false);
INSERT INTO nfs_exports (user_id, status_id, name, desc, path, ro, kerb_auth)
VALUES (
    (SELECT id FROM users WHERE name = 'Superman'), 
    (SELECT id FROM export_status WHERE status = 'enabled'),
    'Very PRIVATE share',
    'Why share it, when it''s private??',
    '/home/superman/private', 
    true,
    true);

