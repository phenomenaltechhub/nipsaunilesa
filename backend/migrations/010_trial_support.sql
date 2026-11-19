DROP TRIGGER community_role_insert;
DROP TRIGGER community_role_delete;
CREATE TABLE roles_m9(account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
 role TEXT NOT NULL CHECK(role IN('student','representative','executive','administrator','reviewer','support')),
 level INTEGER,permissions TEXT NOT NULL DEFAULT '[]',PRIMARY KEY(account_id,role));
INSERT INTO roles_m9 SELECT * FROM roles;
DROP TABLE roles;
ALTER TABLE roles_m9 RENAME TO roles;
CREATE TRIGGER community_role_insert AFTER INSERT ON roles BEGIN UPDATE community_stream SET revision=revision+1 WHERE id=1;END;
CREATE TRIGGER community_role_delete AFTER DELETE ON roles BEGIN UPDATE community_stream SET revision=revision+1 WHERE id=1;END;
CREATE TABLE trial_environment(id TEXT PRIMARY KEY,expires_at INTEGER NOT NULL,revoked_at INTEGER);
CREATE TABLE trial_members(account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
 trial_id TEXT NOT NULL REFERENCES trial_environment(id),expires_at INTEGER NOT NULL,revoked_at INTEGER);
CREATE TABLE activation_policy(id INTEGER PRIMARY KEY CHECK(id=1),batches_required INTEGER NOT NULL DEFAULT 0,revision INTEGER NOT NULL DEFAULT 1);
INSERT INTO activation_policy(id)VALUES(1);
CREATE TABLE activation_batches(id TEXT PRIMARY KEY,title TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'closed' CHECK(status IN('open','closed')),
 opens_at INTEGER NOT NULL,closes_at INTEGER NOT NULL,revision INTEGER NOT NULL DEFAULT 1,created_at INTEGER NOT NULL);
CREATE TABLE activation_batch_members(batch_id TEXT REFERENCES activation_batches(id) ON DELETE CASCADE,
 account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,PRIMARY KEY(batch_id,account_id));
