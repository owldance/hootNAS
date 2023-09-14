/* 
    * nfs_exports table
    * note: if you add a new boolean column, you must also add it to the
    * booleanProperties object in webapi/nfs/selectNfsByUserId.mjs file
    *
*/

CREATE TABLE IF NOT EXISTS nfs_exports (
    id	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    user_id	INTEGER NOT NULL,
    status_id	INTEGER NOT NULL DEFAULT 1,
    modified	TEXT DEFAULT CURRENT_TIMESTAMP,
    created	TEXT DEFAULT CURRENT_TIMESTAMP,
    name	TEXT DEFAULT NULL,
    desc	TEXT DEFAULT NULL,
    clients	TEXT DEFAULT NULL,
    size_limit	INTEGER NOT NULL DEFAULT 0,
    expert_config	TEXT DEFAULT NULL,
    kerb_auth BOOLEAN DEFAULT FALSE,
    path TEXT NOT NULL UNIQUE,
    sec TEXT DEFAULT NULL,
    ro BOOLEAN DEFAULT TRUE,
    sync BOOLEAN DEFAULT TRUE,
    wdelay BOOLEAN DEFAULT TRUE,
    hide BOOLEAN DEFAULT TRUE,
    crossmnt BOOLEAN DEFAULT NULL,
    subtree_check BOOLEAN DEFAULT FALSE,
    secure_locks BOOLEAN DEFAULT TRUE,
    mountpoint TEXT DEFAULT NULL,
    fsid TEXT DEFAULT NULL,
    nordirplus BOOLEAN DEFAULT FALSE,
    refer TEXT DEFAULT NULL,
    replicas TEXT DEFAULT NULL,
    pnfs BOOLEAN DEFAULT FALSE,
    security_label BOOLEAN DEFAULT FALSE,
    root_squash BOOLEAN DEFAULT TRUE,
    all_squash BOOLEAN DEFAULT FALSE,
    anonuid INTEGER DEFAULT NULL,
    anongid INTEGER DEFAULT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

/* create table user_status */
CREATE TABLE IF NOT EXISTS share_status (
    id	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    status	TEXT NOT NULL
);
