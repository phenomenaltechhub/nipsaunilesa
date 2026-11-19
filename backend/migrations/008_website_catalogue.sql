-- Public website metadata only. This remains inside the existing private store.
CREATE TABLE website_catalogue_cache(id INTEGER PRIMARY KEY CHECK(id=1),source_url TEXT NOT NULL,version TEXT NOT NULL,payload TEXT NOT NULL,payload_hash TEXT NOT NULL,etag TEXT,last_modified TEXT,validated_at INTEGER NOT NULL);
CREATE TABLE website_catalogue_entries(id TEXT PRIMARY KEY,payload TEXT NOT NULL,payload_hash TEXT NOT NULL,state TEXT NOT NULL CHECK(state IN('published','withdrawn')),source_version TEXT NOT NULL,updated_at INTEGER NOT NULL,withdrawn_at INTEGER);
CREATE INDEX website_catalogue_entry_state ON website_catalogue_entries(state,id);
CREATE TABLE website_catalogue_history(version TEXT PRIMARY KEY,generated_at INTEGER NOT NULL,source_revision TEXT,publication_sequence INTEGER,accepted_at INTEGER NOT NULL);
