/* populate table job_status */
INSERT INTO job_status (status) VALUES ('idle');
INSERT INTO job_status (status) VALUES ('running');
INSERT INTO job_status (status) VALUES ('finished');
INSERT INTO job_status (status) VALUES ('disabled');
INSERT INTO job_status (status) VALUES ('error');
INSERT INTO job_status (status) VALUES ('pending');
INSERT INTO job_status (status) VALUES ('provisioning');
INSERT INTO job_status (status) VALUES ('enabled');
INSERT INTO job_status (status) VALUES ('queued');
INSERT INTO job_status (status) VALUES ('active');
INSERT INTO job_status (status) VALUES ('inactive');


-- insert one random row into table job_queue
INSERT INTO job_queue (user_id, status_id, name, desc, runjob, runon, interval, data)
VALUES (
    (SELECT id FROM users WHERE name = 'Superman'), 
    (SELECT id FROM job_status WHERE status = 'idle'),
    'my job',
    'used for personal files',
    'create-nfs',
    '* * * * *',
    0,
    '{"nfs_exports_id": 1}');

-- insert one random row into table job_queue
INSERT INTO job_queue (user_id, status_id, name, desc, runjob, runon, interval, data)
VALUES (
    (SELECT id FROM users WHERE name = 'Superman'), 
    (SELECT id FROM job_status WHERE status = 'idle'),
    'my job',
    'used for personal files',
    'create-nfs',
    '* * * * *',
    0,
    '{"nfs_exports_id": 2}');


