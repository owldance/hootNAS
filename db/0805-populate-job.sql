-- insert one random row into table job_queue
INSERT INTO job_queue (user_id, name, desc, script, run_on, run_interval, script_data)
VALUES (
    (SELECT id FROM users WHERE name = 'Superman'), 
    'my job',
    'used for personal files',
    'create-nfs',
    datetime('now', 'localtime', '-10 seconds'),
    0,
    '{"nfs_exports_id": 4}');

INSERT INTO job_queue (user_id, name, desc, script, run_on, run_interval, script_data)
VALUES (
    (SELECT id FROM users WHERE name = 'Superman'), 
    'my job',
    'used for personal files',
    'create-nfs',
    datetime('now', 'localtime', '-60 seconds'),
    0,
    '{"nfs_exports_id": 3}');

INSERT INTO job_queue (user_id, name, desc, script, run_on, run_interval, script_data)
VALUES (
    (SELECT id FROM users WHERE name = 'Superman'), 
    'my job',
    'used for personal files',
    'create-nfs',
    datetime('now', 'localtime', '-30 seconds'),
    0,
    '{"nfs_exports_id": 2}');

INSERT INTO job_queue (user_id, name, desc, script, run_on, run_interval, script_data)
VALUES (
    (SELECT id FROM users WHERE name = 'Superman'), 
    'my job',
    'used for personal files',
    'create-nfs',
    datetime('now', 'localtime', '-90 seconds'),
    0,
    '{"nfs_exports_id": 1}');


SELECT id, script, run_on, run_interval, run_exit_code FROM job_queue
WHERE idle = 1 AND run_on < datetime('now', 'localtime') AND run_interval != 0 OR run_exit_code IS NULL
ORDER BY run_on ASC;


-- update job_queue job
-- UPDATE job_queue 
-- SET run_exit_code = 0
-- WHERE id = 3;

