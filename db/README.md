# hootNAS - Sqlite db 

## Schema
This is the schema of the sqlite db so far. 

![db schema](/db/assets/db-schema.drawio.svg "db schema")

The database `hoot.db` is created by the various sql scripts in this directory, 
which also inserts some test users, groups and user status, in the respective 
tables.

To create a new db, run the following commands from the db directory:

```bash
rm hoot.db
for sqlfile in ./????-*.sql
do
	[ -e "${sqlfile}" ] && sqlite3 hoot.db < $sqlfile
done
```

To query the database from ES6 modules, use the 
[node-sqlite client](https://github.com/kriasoft/node-sqlite) which adds ES6 
promises and SQL-based migrations to the 
[node-sqlite3 client and driver](https://github.com/TryGhost/node-sqlite3).
