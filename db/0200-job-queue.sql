/* 
    * job_queue table
    *
*/
CREATE TABLE IF NOT EXISTS job_queue (
    id	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    user_id	INTEGER NOT NULL, 
    modified	TEXT DEFAULT CURRENT_TIMESTAMP,
    created	TEXT DEFAULT CURRENT_TIMESTAMP,
    name	TEXT DEFAULT NULL,
    desc	TEXT DEFAULT NULL,
    idle BOOLEAN NOT NULL DEFAULT TRUE,
    script	TEXT NOT NULL,
    script_data TEXT DEFAULT NULL,
    run_on TEXT DEFAULT CURRENT_TIMESTAMP,
    run_interval INTEGER NOT NULL DEFAULT 0,
    run_started  TEXT DEFAULT NULL,
    run_ended  TEXT DEFAULT NULL,
    run_message  TEXT DEFAULT NULL,
    run_exit_code INTEGER DEFAULT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

