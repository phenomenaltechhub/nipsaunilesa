CREATE TABLE recovery_tokens_next(token_hash TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,kind TEXT NOT NULL CHECK(kind IN('activation','recovery','mfa_recovery')),expires_at INTEGER NOT NULL,used_at INTEGER,approved_by TEXT REFERENCES accounts(id) ON DELETE SET NULL);
INSERT INTO recovery_tokens_next(token_hash,account_id,kind,expires_at,used_at)SELECT token_hash,account_id,kind,expires_at,used_at FROM recovery_tokens;
DROP TABLE recovery_tokens;
ALTER TABLE recovery_tokens_next RENAME TO recovery_tokens;
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE INDEX sessions_idle ON sessions(last_seen);
CREATE INDEX proof_expiry ON recovery_tokens(expires_at);
CREATE INDEX audit_time ON audit(created_at);
