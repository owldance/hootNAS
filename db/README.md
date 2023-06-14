# hootNAS - Sqlite db 

## Schema
This is the schema of the sqlite db so far. 

![db schema](/documentation/assets/hoot-db.drawio.svg "db schema")

The database `hoot.db` is created by the [hoot.sql](/db/hoot.sql) script, 
which also inserts some test users, groups and user status, in the respective 
tables.

To create a new db, run the following commands from the db directory:

```bash
rm hoot.db
sqlite3 hoot.db < hoot.sql
```

To query the database from within JavaScript modules, use the 
[sqlite-node client](https://github.com/kriasoft/node-sqlite) which is 
already installed along with the 
[sqlite3-node database driver](https://github.com/TryGhost/node-sqlite3).
