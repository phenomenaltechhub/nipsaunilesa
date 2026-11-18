ALTER TABLE community_messages ADD COLUMN website_refs TEXT NOT NULL DEFAULT '[]';
ALTER TABLE notices ADD COLUMN website_refs TEXT NOT NULL DEFAULT '[]';
ALTER TABLE community_versions ADD COLUMN website_refs TEXT NOT NULL DEFAULT '[]';
