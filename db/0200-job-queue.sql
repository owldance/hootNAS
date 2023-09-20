/* 
    * job_queue table
    *
*/
CREATE TABLE IF NOT EXISTS job_queue (
    id	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    user_id	INTEGER NOT NULL, 
    status_id	INTEGER NOT NULL DEFAULT 1,
    modified	TEXT DEFAULT CURRENT_TIMESTAMP,
    created	TEXT DEFAULT CURRENT_TIMESTAMP,
    name	TEXT DEFAULT NULL,
    desc	TEXT DEFAULT NULL,
    run_job	TEXT NOT NULL,
    run_on  TEXT DEFAULT NULL,
    run_interval INTEGER NOT NULL DEFAULT 0,
    run_data TEXT DEFAULT NULL,
    run_message  TEXT DEFAULT NULL,
    run_success BOOLEAN DEFAULT TRUE,
    run_exit_code INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

/* create table export_status */
CREATE TABLE IF NOT EXISTS job_status (
    id	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    status	TEXT NOT NULL
);

