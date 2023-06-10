# hootNAS - Sqlite db 

## Schema
This is the schema of the sqlite db so far. 

![db schema](/documentation/assets/hoot-db.drawio.svg "db schema")

It is created by the [hoot.sql](/db/hoot.sql) script, which also inserts some 
test users, groups and user status, in the respectice tables.

To create a new db, run the following commands from the db directory:

```bash
rm hoot.db
sqlite3 hoot.db < hoot.sql
```
