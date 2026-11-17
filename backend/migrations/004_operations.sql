CREATE TABLE courses(
 id TEXT PRIMARY KEY,level INTEGER NOT NULL CHECK(level IN(100,200,300)),session TEXT NOT NULL,semester TEXT NOT NULL CHECK(semester IN('first','second')),code TEXT NOT NULL,
 author TEXT REFERENCES accounts(id) ON DELETE SET NULL,payload TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN('draft','submitted','revisions','published','withdrawn')),
 revision INTEGER NOT NULL DEFAULT 1,published_payload TEXT,published_revision INTEGER,reviewer TEXT REFERENCES accounts(id) ON DELETE SET NULL,updated_at INTEGER NOT NULL,
 audience TEXT NOT NULL DEFAULT 'level' CHECK(audience IN('level','selected')),UNIQUE(level,session,semester,code)
);
CREATE TABLE course_access(course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,PRIMARY KEY(course_id,account_id));
CREATE TABLE course_versions(id INTEGER PRIMARY KEY AUTOINCREMENT,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,revision INTEGER NOT NULL,actor TEXT REFERENCES accounts(id) ON DELETE SET NULL,action TEXT NOT NULL,payload TEXT NOT NULL,created_at INTEGER NOT NULL);
ALTER TABLE courses ADD COLUMN last_editor TEXT REFERENCES accounts(id) ON DELETE SET NULL;
ALTER TABLE course_versions ADD COLUMN note TEXT NOT NULL DEFAULT '';
CREATE TABLE topic_progress(account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,topic_id TEXT NOT NULL,payload TEXT NOT NULL,revision INTEGER NOT NULL,updated_at INTEGER NOT NULL,PRIMARY KEY(account_id,course_id,topic_id));
CREATE TABLE notification_preferences(account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,announcements INTEGER NOT NULL DEFAULT 1,resources INTEGER NOT NULL DEFAULT 1,revision INTEGER NOT NULL DEFAULT 0);
CREATE TABLE notices(id TEXT PRIMARY KEY,author TEXT REFERENCES accounts(id) ON DELETE SET NULL,author_role TEXT NOT NULL,title TEXT NOT NULL,message TEXT NOT NULL,kind TEXT NOT NULL,scope TEXT NOT NULL CHECK(scope IN('all','level','course')),level INTEGER,course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,priority TEXT NOT NULL,publish_at INTEGER NOT NULL,delivered_at INTEGER,status TEXT NOT NULL CHECK(status IN('scheduled','published','withdrawn','held')),revision INTEGER NOT NULL DEFAULT 1,created_at INTEGER NOT NULL);
CREATE TABLE notice_recipients(notice_id TEXT NOT NULL REFERENCES notices(id) ON DELETE CASCADE,account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,PRIMARY KEY(notice_id,account_id));
ALTER TABLE notices ADD COLUMN exam_id TEXT REFERENCES cbt_exams(id) ON DELETE CASCADE;
ALTER TABLE notices ADD COLUMN publisher TEXT REFERENCES accounts(id) ON DELETE SET NULL;
ALTER TABLE notices ADD COLUMN publisher_role TEXT;
CREATE INDEX notices_delivery ON notices(status,publish_at);
CREATE TABLE notice_versions(id INTEGER PRIMARY KEY AUTOINCREMENT,notice_id TEXT NOT NULL REFERENCES notices(id) ON DELETE CASCADE,revision INTEGER NOT NULL,actor TEXT REFERENCES accounts(id) ON DELETE SET NULL,payload TEXT NOT NULL,created_at INTEGER NOT NULL);
CREATE TABLE notice_reads(account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,notice_id TEXT NOT NULL REFERENCES notices(id) ON DELETE CASCADE,revision INTEGER NOT NULL,PRIMARY KEY(account_id,notice_id));
CREATE TABLE community_messages(id INTEGER PRIMARY KEY AUTOINCREMENT,author TEXT REFERENCES accounts(id) ON DELETE SET NULL,body TEXT NOT NULL,reply_to INTEGER REFERENCES community_messages(id),mentions TEXT NOT NULL,removed INTEGER NOT NULL DEFAULT 0,revision INTEGER NOT NULL DEFAULT 1,request_id TEXT NOT NULL,fingerprint TEXT NOT NULL,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL,UNIQUE(author,request_id));
CREATE INDEX community_order ON community_messages(id DESC);
CREATE TABLE community_versions(id INTEGER PRIMARY KEY AUTOINCREMENT,message_id INTEGER NOT NULL REFERENCES community_messages(id) ON DELETE CASCADE,actor TEXT REFERENCES accounts(id) ON DELETE SET NULL,body TEXT NOT NULL,revision INTEGER NOT NULL,created_at INTEGER NOT NULL);
CREATE TABLE community_reactions(message_id INTEGER NOT NULL REFERENCES community_messages(id) ON DELETE CASCADE,account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,reaction TEXT NOT NULL,PRIMARY KEY(message_id,account_id,reaction));
CREATE TABLE community_reports(id TEXT PRIMARY KEY,message_id INTEGER NOT NULL REFERENCES community_messages(id) ON DELETE CASCADE,reporter TEXT REFERENCES accounts(id) ON DELETE SET NULL,reason TEXT NOT NULL,note TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'open',revision INTEGER NOT NULL DEFAULT 1,created_at INTEGER NOT NULL,UNIQUE(message_id,reporter));
ALTER TABLE community_reports ADD COLUMN decision_note TEXT NOT NULL DEFAULT '';
CREATE TABLE cbt_policy(id INTEGER PRIMARY KEY CHECK(id=1),intake_open INTEGER NOT NULL DEFAULT 0,visibility_warnings INTEGER NOT NULL DEFAULT 3 CHECK(visibility_warnings IN(2,3)),revision INTEGER NOT NULL DEFAULT 1);
INSERT INTO cbt_policy(id)VALUES(1);
CREATE TABLE cbt_requests(id TEXT PRIMARY KEY,requester TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,payload TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'submitted',revision INTEGER NOT NULL DEFAULT 1,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL);
CREATE TABLE cbt_decisions(id INTEGER PRIMARY KEY AUTOINCREMENT,request_id TEXT NOT NULL REFERENCES cbt_requests(id) ON DELETE CASCADE,actor TEXT REFERENCES accounts(id) ON DELETE SET NULL,action TEXT NOT NULL,note TEXT NOT NULL,revision INTEGER NOT NULL,created_at INTEGER NOT NULL);
CREATE TABLE cbt_applications(request_id TEXT PRIMARY KEY REFERENCES cbt_requests(id) ON DELETE CASCADE,encrypted_payload TEXT NOT NULL,filename TEXT NOT NULL,revision INTEGER NOT NULL,created_at INTEGER NOT NULL);
CREATE TABLE cbt_questions(id TEXT PRIMARY KEY,request_id TEXT NOT NULL REFERENCES cbt_requests(id) ON DELETE CASCADE,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,encrypted_payload TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'candidate' CHECK(status IN('candidate','authorized','withdrawn')),revision INTEGER NOT NULL DEFAULT 1);
CREATE TABLE cbt_exams(id TEXT PRIMARY KEY,request_id TEXT REFERENCES cbt_requests(id) ON DELETE SET NULL,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,title TEXT NOT NULL,kind TEXT NOT NULL CHECK(kind IN('pre_exam_revision','periodic')),starts_at INTEGER NOT NULL,duration_minutes INTEGER NOT NULL,attempt_limit INTEGER NOT NULL,capacity INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN('planned','scheduled','held','cancelled')),revision INTEGER NOT NULL DEFAULT 1,created_at INTEGER NOT NULL);
ALTER TABLE cbt_exams ADD COLUMN course_snapshot TEXT;
CREATE TABLE cbt_blueprints(exam_id TEXT NOT NULL REFERENCES cbt_exams(id) ON DELETE CASCADE,question_id TEXT NOT NULL REFERENCES cbt_questions(id) ON DELETE CASCADE,PRIMARY KEY(exam_id,question_id));
CREATE TABLE cbt_batches(id TEXT PRIMARY KEY,exam_id TEXT NOT NULL REFERENCES cbt_exams(id) ON DELETE CASCADE,title TEXT NOT NULL,starts_at INTEGER NOT NULL,capacity INTEGER NOT NULL);
CREATE TABLE cbt_assignments(id TEXT PRIMARY KEY,exam_id TEXT NOT NULL REFERENCES cbt_exams(id) ON DELETE CASCADE,batch_id TEXT NOT NULL REFERENCES cbt_batches(id) ON DELETE CASCADE,account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,state TEXT NOT NULL DEFAULT 'assigned' CHECK(state IN('assigned','not_started','in_progress','submitted','expired','interrupted','requires_review')),updated_at INTEGER NOT NULL,UNIQUE(exam_id,account_id));
CREATE TABLE cbt_results(assignment_id TEXT PRIMARY KEY REFERENCES cbt_assignments(id) ON DELETE CASCADE,encrypted_payload TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN('pending_review','reviewed','published')),revision INTEGER NOT NULL DEFAULT 1);
ALTER TABLE cbt_results ADD COLUMN published_at INTEGER;
CREATE TABLE cbt_incidents(id INTEGER PRIMARY KEY AUTOINCREMENT,assignment_id TEXT NOT NULL REFERENCES cbt_assignments(id) ON DELETE CASCADE,kind TEXT NOT NULL CHECK(kind IN('visibility_hidden','disconnected','interrupted')),observed_at INTEGER NOT NULL,review_status TEXT NOT NULL DEFAULT 'unreviewed');
CREATE TRIGGER operations_account_deletion BEFORE DELETE ON accounts BEGIN
 UPDATE community_messages SET body='Message removed after account deletion',removed=1,revision=revision+1 WHERE author=OLD.id;
 DELETE FROM community_versions WHERE actor=OLD.id OR message_id IN(SELECT id FROM community_messages WHERE author=OLD.id);
 UPDATE cbt_exams SET status='cancelled',revision=revision+1 WHERE request_id IN(SELECT id FROM cbt_requests WHERE requester=OLD.id);
END;

-- Preserve context-complete M5 drafts as unpublished courses. Legacy originals remain an archive.
INSERT OR IGNORE INTO courses(id,level,session,semester,code,author,payload,status,updated_at) SELECT id,level,json_extract(payload,'$.session'),json_extract(payload,'$.semester'),json_extract(payload,'$.code'),actor,json_set(payload,'$.topics',json('[]'),'$.resources',json('[]'),'$.syllabus',''),'draft',created_at FROM academic_drafts WHERE json_valid(payload) AND length(json_extract(payload,'$.session'))=9 AND json_extract(payload,'$.semester') IN('first','second');
UPDATE courses SET last_editor=author WHERE last_editor IS NULL;
INSERT INTO course_versions(course_id,revision,actor,action,payload,created_at,note) SELECT id,revision,author,'migrated_m5_draft',payload,updated_at,'Preserved unpublished M5 intake' FROM courses WHERE id IN(SELECT id FROM academic_drafts);
