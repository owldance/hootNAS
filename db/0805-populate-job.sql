/* populate table job_status */
INSERT INTO job_status (status) VALUES ('active');
INSERT INTO job_status (status) VALUES ('disabled');
INSERT INTO job_status (status) VALUES ('queued');
INSERT INTO job_status (status) VALUES ('error');
INSERT INTO job_status (status) VALUES ('pending');
INSERT INTO job_status (status) VALUES ('provisioning');


-- insert one random row into table job_queue
INSERT INTO job_queue (user_id, status_id, name, desc, job, runon, interval, data)
VALUES (
    (SELECT id FROM users WHERE name = 'Superman'), 
    (SELECT id FROM job_status WHERE status = 'active'),
    'my job',
    'used for personal files',
    'create-nfs',
    '* * * * *',
    0,
    '{"nfs_exports_id": 1}');

