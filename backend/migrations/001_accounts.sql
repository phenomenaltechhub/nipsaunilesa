PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY,applied_at INTEGER NOT NULL);
CREATE TABLE accounts(
 id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,name TEXT NOT NULL,level INTEGER NOT NULL CHECK(level IN(100,200,300)),
 status TEXT NOT NULL CHECK(status IN('pending_activation','active','temporarily_restricted','suspended','graduated','expired','deactivated','pending_deletion')),
 password_hash TEXT,dues_verified INTEGER NOT NULL DEFAULT 0 CHECK(dues_verified IN(0,1)),ownership_verified INTEGER,
 security_version INTEGER NOT NULL DEFAULT 1,mfa_secret TEXT,mfa_pending TEXT,mfa_pending_until INTEGER,mfa_last_step INTEGER NOT NULL DEFAULT -1,
 mfa_failures INTEGER NOT NULL DEFAULT 0,mfa_until INTEGER NOT NULL DEFAULT 0,delete_after INTEGER,created_at INTEGER NOT NULL
);
CREATE TABLE roles(account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,role TEXT NOT NULL CHECK(role IN('student','representative','executive','administrator','reviewer')),level INTEGER,permissions TEXT NOT NULL DEFAULT '[]',PRIMARY KEY(account_id,role));
CREATE TABLE sessions(id_hash TEXT PRIMARY KEY,account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,version INTEGER,active_role TEXT NOT NULL DEFAULT 'student',mfa_at INTEGER,created_at INTEGER NOT NULL,last_seen INTEGER NOT NULL,expires_at INTEGER NOT NULL);
CREATE TABLE login_failures(subject TEXT PRIMARY KEY,failures INTEGER NOT NULL,locked_until INTEGER NOT NULL,last_failure INTEGER NOT NULL);
CREATE TABLE rate_limits(subject TEXT PRIMARY KEY,count INTEGER NOT NULL,reset_at INTEGER NOT NULL);
CREATE TABLE recovery_tokens(token_hash TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,kind TEXT NOT NULL CHECK(kind IN('activation','recovery')),expires_at INTEGER NOT NULL,used_at INTEGER);
CREATE TABLE audit(id INTEGER PRIMARY KEY AUTOINCREMENT,actor TEXT,action TEXT NOT NULL,target TEXT,metadata TEXT NOT NULL,created_at INTEGER NOT NULL,previous_hash TEXT NOT NULL,entry_hash TEXT NOT NULL);
CREATE TRIGGER audit_no_update BEFORE UPDATE ON audit BEGIN SELECT RAISE(ABORT,'Append-only audit');END;
CREATE TRIGGER audit_no_delete BEFORE DELETE ON audit BEGIN SELECT RAISE(ABORT,'Append-only audit');END;
CREATE TABLE financial_ledger(id TEXT PRIMARY KEY,account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,reference_hash TEXT NOT NULL,status TEXT NOT NULL);
CREATE TABLE community_state(id INTEGER PRIMARY KEY CHECK(id=1),is_open INTEGER NOT NULL DEFAULT 0 CHECK(is_open IN(0,1)),revision INTEGER NOT NULL DEFAULT 1);
INSERT INTO community_state(id,is_open)VALUES(1,0);
CREATE TABLE chat_suspensions(account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,created_at INTEGER NOT NULL);
