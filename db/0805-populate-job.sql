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
-- insert one random row into table job_queue
INSERT INTO job_queue (user_id, status_id, name, desc, run_job, run_on, run_interval, run_data)
VALUES (
    (SELECT id FROM users WHERE name = 'Superman'), 
    (SELECT id FROM job_status WHERE status = 'idle'),
    'my job',
    'used for personal files',
    'create-nfs',
    '* * * * *',
    0,
    '{"nfs_exports_id": 1}');

INSERT INTO job_queue (user_id, status_id, name, desc, run_job, run_on, run_interval, run_data)
VALUES (
    (SELECT id FROM users WHERE name = 'Superman'), 
    (SELECT id FROM job_status WHERE status = 'idle'),
    'my job',
    'used for personal files',
    'create-nfs',
    '* * * * *',
    0,
    '{"nfs_exports_id": 2}');

INSERT INTO job_queue (user_id, status_id, name, desc, run_job, run_on, run_interval, run_data)
VALUES (
    (SELECT id FROM users WHERE name = 'Superman'), 
    (SELECT id FROM job_status WHERE status = 'idle'),
    'my job',
    'used for personal files',
    'create-nfs',
    '* * * * *',
    0,
    '{"nfs_exports_id": 3}');



SELECT 
    job_queue.id, 
    job_queue.status_id, 
    job_status.status, 
    job_queue.run_interval, 
    job_queue.run_message, 
    job_queue.run_success, 
    job_queue.run_exit_code
FROM job_queue
JOIN job_status ON job_queue.status_id = job_status.id;

-- update job_queue, set status to idle where status is running
UPDATE job_queue 
SET status_id = (SELECT id FROM job_status WHERE status = 'idle') 
WHERE status_id = (SELECT id FROM job_status WHERE status = 'running');

