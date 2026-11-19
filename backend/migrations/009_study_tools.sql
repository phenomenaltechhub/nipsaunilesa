CREATE TABLE academic_calendar(
 id TEXT PRIMARY KEY,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
 level INTEGER NOT NULL,kind TEXT NOT NULL CHECK(kind IN('class','assignment','deadline','event')),
 payload TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN('published','withdrawn')),
 revision INTEGER NOT NULL DEFAULT 1,author TEXT REFERENCES accounts(id) ON DELETE SET NULL,
 updated_at INTEGER NOT NULL
);
CREATE INDEX academic_calendar_course ON academic_calendar(course_id,status);
CREATE TABLE academic_calendar_versions(
 id INTEGER PRIMARY KEY,entry_id TEXT NOT NULL REFERENCES academic_calendar(id) ON DELETE CASCADE,
 revision INTEGER NOT NULL,actor TEXT,action TEXT NOT NULL,payload TEXT NOT NULL,created_at INTEGER NOT NULL
);
CREATE TABLE study_content(
 id TEXT PRIMARY KEY,kind TEXT NOT NULL CHECK(kind IN('glossary','flashcard','practice')),
 course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,payload TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN('draft','submitted','revisions','published','withdrawn')),
 revision INTEGER NOT NULL DEFAULT 1,published_revision INTEGER,published_payload TEXT,
 author TEXT REFERENCES accounts(id) ON DELETE SET NULL,last_editor TEXT REFERENCES accounts(id) ON DELETE SET NULL,
 updated_at INTEGER NOT NULL
);
CREATE INDEX study_content_course ON study_content(course_id,kind,status);
CREATE TABLE study_content_versions(
 id INTEGER PRIMARY KEY,content_id TEXT NOT NULL REFERENCES study_content(id) ON DELETE CASCADE,
 revision INTEGER NOT NULL,actor TEXT,action TEXT NOT NULL,payload TEXT NOT NULL,created_at INTEGER NOT NULL
);
CREATE TABLE daily_study_term(day TEXT PRIMARY KEY,content_id TEXT NOT NULL REFERENCES study_content(id),payload TEXT NOT NULL,revision INTEGER NOT NULL);
CREATE TABLE study_bookmarks(account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
 content_id TEXT NOT NULL REFERENCES study_content(id) ON DELETE CASCADE,created_at INTEGER NOT NULL,PRIMARY KEY(account_id,content_id));
CREATE TABLE study_activity(account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
 content_id TEXT NOT NULL REFERENCES study_content(id) ON DELETE CASCADE,visited_at INTEGER NOT NULL,PRIMARY KEY(account_id,content_id));
CREATE TABLE study_practice(id TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
 content_id TEXT NOT NULL REFERENCES study_content(id) ON DELETE CASCADE,content_revision INTEGER NOT NULL,
 request_id TEXT NOT NULL,answer INTEGER NOT NULL,correct INTEGER NOT NULL,created_at INTEGER NOT NULL,UNIQUE(account_id,request_id));
CREATE TABLE account_preferences(account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
 payload TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 1,updated_at INTEGER NOT NULL);
CREATE TABLE study_plans(account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
 encrypted_payload TEXT NOT NULL,revision INTEGER NOT NULL,updated_at INTEGER NOT NULL);
CREATE TABLE study_saved_targets(account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
 kind TEXT NOT NULL CHECK(kind IN('topic','resource')),target_id TEXT NOT NULL,
 course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,created_at INTEGER NOT NULL,
 PRIMARY KEY(account_id,kind,target_id));
