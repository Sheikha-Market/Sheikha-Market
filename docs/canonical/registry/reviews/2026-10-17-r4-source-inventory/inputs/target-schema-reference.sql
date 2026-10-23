-- LABORATORY SPECIMEN ONLY. No production authorization. No automatic migration.
-- SHEIKHA review model only. Never run against the original master database.
-- No migration, networking, Hostinger changes, or operating authority.
PRAGMA foreign_keys = ON;

CREATE TABLE metadata (key TEXT PRIMARY KEY NOT NULL CHECK(typeof(key)='text' AND length(trim(key))>0), value_json TEXT NOT NULL) WITHOUT ROWID;

CREATE TABLE sources (
 source_id TEXT PRIMARY KEY NOT NULL CHECK(typeof(source_id)='text' AND length(trim(source_id))>0), kind TEXT NOT NULL, title TEXT NOT NULL,
 locator TEXT NOT NULL, sha256 TEXT, access_scope TEXT NOT NULL
) WITHOUT ROWID;
CREATE TABLE observed_artifacts (
 observation_id TEXT PRIMARY KEY NOT NULL CHECK(typeof(observation_id)='text' AND length(trim(observation_id))>0), stage TEXT NOT NULL, kind TEXT NOT NULL,
 path TEXT NOT NULL, observed_at_utc TEXT NOT NULL, bytes INTEGER NOT NULL CHECK(bytes>=0),
 sha256 TEXT NOT NULL CHECK(length(sha256)=64 AND sha256 NOT GLOB '*[^0-9a-f]*'),
 evidence_source_id TEXT NOT NULL REFERENCES sources(source_id),
 runtime_verified INTEGER NOT NULL DEFAULT 0 CHECK(runtime_verified=0)
) WITHOUT ROWID;
CREATE TABLE catalog_claims (
 claim_id TEXT PRIMARY KEY NOT NULL CHECK(typeof(claim_id)='text' AND length(trim(claim_id))>0), stage TEXT NOT NULL, catalog TEXT NOT NULL,
 original_item_id TEXT NOT NULL, payload_json TEXT NOT NULL,
 source_id TEXT NOT NULL REFERENCES sources(source_id), source_lines TEXT NOT NULL,
 assessment TEXT NOT NULL CHECK(assessment IN ('SOURCE_CLAIM_ONLY','REQUIRES_MEASUREMENT','REQUIRES_LEGAL_REVIEW'))
) WITHOUT ROWID;
CREATE TABLE findings (
 finding_id TEXT PRIMARY KEY NOT NULL CHECK(typeof(finding_id)='text' AND length(trim(finding_id))>0), severity TEXT NOT NULL CHECK(severity IN ('HIGH','MEDIUM','LOW')),
 stage TEXT NOT NULL, title TEXT NOT NULL, evidence TEXT NOT NULL,
 basis TEXT NOT NULL, source_id TEXT NOT NULL REFERENCES sources(source_id),
 source_locator TEXT NOT NULL, proposed_action TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('OPEN','DESIGN_TESTED_NOT_DEPLOYED'))
) WITHOUT ROWID;
CREATE TABLE entity_records (
 entity_id TEXT PRIMARY KEY NOT NULL CHECK(typeof(entity_id)='text' AND length(trim(entity_id))>0), source_name TEXT NOT NULL, claimed_entity_type TEXT NOT NULL,
 legal_status TEXT NOT NULL CHECK(legal_status IN ('USER_DECLARED_UNVERIFIED','CONCEPT_NOT_REGISTERED')),
 source_id TEXT NOT NULL REFERENCES sources(source_id)
) WITHOUT ROWID;
CREATE TABLE entity_identifiers (
 identifier_id TEXT PRIMARY KEY NOT NULL CHECK(typeof(identifier_id)='text' AND length(trim(identifier_id))>0), entity_id TEXT NOT NULL REFERENCES entity_records(entity_id),
 jurisdiction TEXT NOT NULL, issuer_label TEXT NOT NULL, scheme TEXT NOT NULL,
 value TEXT NOT NULL, verification TEXT NOT NULL CHECK(verification IN ('UNVERIFIED','INTERNAL_LABEL_ONLY')),
 UNIQUE(jurisdiction, issuer_label, scheme, value)
) WITHOUT ROWID;
CREATE TABLE documents (
 document_id TEXT PRIMARY KEY NOT NULL CHECK(typeof(document_id)='text' AND length(trim(document_id))>0), entity_id TEXT NOT NULL REFERENCES entity_records(entity_id),
 title TEXT NOT NULL, document_kind TEXT NOT NULL
) WITHOUT ROWID;
CREATE TABLE document_versions (
 version_id TEXT PRIMARY KEY NOT NULL CHECK(typeof(version_id)='text' AND length(trim(version_id))>0), document_id TEXT NOT NULL REFERENCES documents(document_id),
 version_label TEXT NOT NULL, source_id TEXT NOT NULL REFERENCES sources(source_id),
 accepted_at TEXT, effective_at TEXT, status TEXT NOT NULL CHECK(status IN ('SOURCE_SAMPLE_NOT_ADOPTED','DRAFT_NOT_ADOPTED')),
 UNIQUE(document_id,version_label),
 CHECK(accepted_at IS NULL AND effective_at IS NULL)
) WITHOUT ROWID;
CREATE TABLE provisions (
 provision_id TEXT PRIMARY KEY NOT NULL CHECK(typeof(provision_id)='text' AND length(trim(provision_id))>0), version_id TEXT NOT NULL REFERENCES document_versions(version_id),
 article_reference TEXT NOT NULL, source_text TEXT NOT NULL,
 text_role TEXT NOT NULL CHECK(text_role IN ('SOURCE_CLAIM','INTERNAL_DRAFT','PARAPHRASE')),
 source_id TEXT NOT NULL REFERENCES sources(source_id), source_lines TEXT NOT NULL,
 UNIQUE(version_id,article_reference)
) WITHOUT ROWID;
CREATE TABLE review_notes (
 review_id TEXT PRIMARY KEY NOT NULL CHECK(typeof(review_id)='text' AND length(trim(review_id))>0), provision_id TEXT NOT NULL REFERENCES provisions(provision_id),
 source_assertion TEXT NOT NULL, analysis_note TEXT NOT NULL,
 shariah_review TEXT NOT NULL CHECK(shariah_review='PENDING'),
 legal_review TEXT NOT NULL CHECK(legal_review='PENDING')
) WITHOUT ROWID;
CREATE TABLE legal_references (
 reference_id TEXT PRIMARY KEY NOT NULL CHECK(typeof(reference_id)='text' AND length(trim(reference_id))>0), jurisdiction TEXT NOT NULL,
 instrument_type TEXT NOT NULL, instrument_title TEXT NOT NULL,
 article_reference TEXT NOT NULL, summary_ar TEXT NOT NULL,
 source_id TEXT NOT NULL REFERENCES sources(source_id),
 content_role TEXT NOT NULL CHECK(content_role='PARAPHRASE_NOT_OFFICIAL_TEXT'),
 review_status TEXT NOT NULL CHECK(review_status='PENDING'),
 executable INTEGER NOT NULL DEFAULT 0 CHECK(executable=0)
) WITHOUT ROWID;
-- Append-only safeguards inside this model; not protection against a DB administrator.
CREATE TRIGGER provision_no_update BEFORE UPDATE ON provisions
 BEGIN SELECT RAISE(ABORT,'APPEND_ONLY_PROVISION_NEW_VERSION_REQUIRED'); END;
CREATE TRIGGER provision_no_delete BEFORE DELETE ON provisions
 BEGIN SELECT RAISE(ABORT,'APPEND_ONLY_PROVISION'); END;
CREATE TRIGGER version_no_update BEFORE UPDATE ON document_versions
 BEGIN SELECT RAISE(ABORT,'APPEND_ONLY_VERSION'); END;
CREATE TRIGGER version_no_delete BEFORE DELETE ON document_versions
 BEGIN SELECT RAISE(ABORT,'APPEND_ONLY_VERSION'); END;

CREATE TRIGGER r2_catalog_claims_no_replace BEFORE INSERT ON "catalog_claims"
 WHEN EXISTS(SELECT 1 FROM "catalog_claims" WHERE ("claim_id"=NEW."claim_id"))
 BEGIN SELECT RAISE(ABORT,'R2_DUPLICATE_INSERT_REJECTED:catalog_claims'); END;
CREATE TRIGGER r2_catalog_claims_no_update BEFORE UPDATE ON "catalog_claims"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:catalog_claims'); END;
CREATE TRIGGER r2_catalog_claims_no_delete BEFORE DELETE ON "catalog_claims"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:catalog_claims'); END;
CREATE TRIGGER r2_document_versions_no_replace BEFORE INSERT ON "document_versions"
 WHEN EXISTS(SELECT 1 FROM "document_versions" WHERE ("version_id"=NEW."version_id") OR ("document_id"=NEW."document_id" AND "version_label"=NEW."version_label"))
 BEGIN SELECT RAISE(ABORT,'R2_DUPLICATE_INSERT_REJECTED:document_versions'); END;
CREATE TRIGGER r2_document_versions_no_update BEFORE UPDATE ON "document_versions"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:document_versions'); END;
CREATE TRIGGER r2_document_versions_no_delete BEFORE DELETE ON "document_versions"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:document_versions'); END;
CREATE TRIGGER r2_documents_no_replace BEFORE INSERT ON "documents"
 WHEN EXISTS(SELECT 1 FROM "documents" WHERE ("document_id"=NEW."document_id"))
 BEGIN SELECT RAISE(ABORT,'R2_DUPLICATE_INSERT_REJECTED:documents'); END;
CREATE TRIGGER r2_documents_no_update BEFORE UPDATE ON "documents"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:documents'); END;
CREATE TRIGGER r2_documents_no_delete BEFORE DELETE ON "documents"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:documents'); END;
CREATE TRIGGER r2_entity_identifiers_no_replace BEFORE INSERT ON "entity_identifiers"
 WHEN EXISTS(SELECT 1 FROM "entity_identifiers" WHERE ("identifier_id"=NEW."identifier_id") OR ("jurisdiction"=NEW."jurisdiction" AND "issuer_label"=NEW."issuer_label" AND "scheme"=NEW."scheme" AND "value"=NEW."value"))
 BEGIN SELECT RAISE(ABORT,'R2_DUPLICATE_INSERT_REJECTED:entity_identifiers'); END;
CREATE TRIGGER r2_entity_identifiers_no_update BEFORE UPDATE ON "entity_identifiers"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:entity_identifiers'); END;
CREATE TRIGGER r2_entity_identifiers_no_delete BEFORE DELETE ON "entity_identifiers"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:entity_identifiers'); END;
CREATE TRIGGER r2_entity_records_no_replace BEFORE INSERT ON "entity_records"
 WHEN EXISTS(SELECT 1 FROM "entity_records" WHERE ("entity_id"=NEW."entity_id"))
 BEGIN SELECT RAISE(ABORT,'R2_DUPLICATE_INSERT_REJECTED:entity_records'); END;
CREATE TRIGGER r2_entity_records_no_update BEFORE UPDATE ON "entity_records"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:entity_records'); END;
CREATE TRIGGER r2_entity_records_no_delete BEFORE DELETE ON "entity_records"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:entity_records'); END;
CREATE TRIGGER r2_findings_no_replace BEFORE INSERT ON "findings"
 WHEN EXISTS(SELECT 1 FROM "findings" WHERE ("finding_id"=NEW."finding_id"))
 BEGIN SELECT RAISE(ABORT,'R2_DUPLICATE_INSERT_REJECTED:findings'); END;
CREATE TRIGGER r2_findings_no_update BEFORE UPDATE ON "findings"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:findings'); END;
CREATE TRIGGER r2_findings_no_delete BEFORE DELETE ON "findings"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:findings'); END;
CREATE TRIGGER r2_legal_references_no_replace BEFORE INSERT ON "legal_references"
 WHEN EXISTS(SELECT 1 FROM "legal_references" WHERE ("reference_id"=NEW."reference_id"))
 BEGIN SELECT RAISE(ABORT,'R2_DUPLICATE_INSERT_REJECTED:legal_references'); END;
CREATE TRIGGER r2_legal_references_no_update BEFORE UPDATE ON "legal_references"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:legal_references'); END;
CREATE TRIGGER r2_legal_references_no_delete BEFORE DELETE ON "legal_references"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:legal_references'); END;
CREATE TRIGGER r2_metadata_no_replace BEFORE INSERT ON "metadata"
 WHEN EXISTS(SELECT 1 FROM "metadata" WHERE ("key"=NEW."key"))
 BEGIN SELECT RAISE(ABORT,'R2_DUPLICATE_INSERT_REJECTED:metadata'); END;
CREATE TRIGGER r2_metadata_no_update BEFORE UPDATE ON "metadata"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:metadata'); END;
CREATE TRIGGER r2_metadata_no_delete BEFORE DELETE ON "metadata"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:metadata'); END;
CREATE TRIGGER r2_observed_artifacts_no_replace BEFORE INSERT ON "observed_artifacts"
 WHEN EXISTS(SELECT 1 FROM "observed_artifacts" WHERE ("observation_id"=NEW."observation_id"))
 BEGIN SELECT RAISE(ABORT,'R2_DUPLICATE_INSERT_REJECTED:observed_artifacts'); END;
CREATE TRIGGER r2_observed_artifacts_no_update BEFORE UPDATE ON "observed_artifacts"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:observed_artifacts'); END;
CREATE TRIGGER r2_observed_artifacts_no_delete BEFORE DELETE ON "observed_artifacts"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:observed_artifacts'); END;
CREATE TRIGGER r2_provisions_no_replace BEFORE INSERT ON "provisions"
 WHEN EXISTS(SELECT 1 FROM "provisions" WHERE ("provision_id"=NEW."provision_id") OR ("version_id"=NEW."version_id" AND "article_reference"=NEW."article_reference"))
 BEGIN SELECT RAISE(ABORT,'R2_DUPLICATE_INSERT_REJECTED:provisions'); END;
CREATE TRIGGER r2_provisions_no_update BEFORE UPDATE ON "provisions"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:provisions'); END;
CREATE TRIGGER r2_provisions_no_delete BEFORE DELETE ON "provisions"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:provisions'); END;
CREATE TRIGGER r2_review_notes_no_replace BEFORE INSERT ON "review_notes"
 WHEN EXISTS(SELECT 1 FROM "review_notes" WHERE ("review_id"=NEW."review_id"))
 BEGIN SELECT RAISE(ABORT,'R2_DUPLICATE_INSERT_REJECTED:review_notes'); END;
CREATE TRIGGER r2_review_notes_no_update BEFORE UPDATE ON "review_notes"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:review_notes'); END;
CREATE TRIGGER r2_review_notes_no_delete BEFORE DELETE ON "review_notes"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:review_notes'); END;
CREATE TRIGGER r2_sources_no_replace BEFORE INSERT ON "sources"
 WHEN EXISTS(SELECT 1 FROM "sources" WHERE ("source_id"=NEW."source_id"))
 BEGIN SELECT RAISE(ABORT,'R2_DUPLICATE_INSERT_REJECTED:sources'); END;
CREATE TRIGGER r2_sources_no_update BEFORE UPDATE ON "sources"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:sources'); END;
CREATE TRIGGER r2_sources_no_delete BEFORE DELETE ON "sources"
 BEGIN SELECT RAISE(ABORT,'R2_APPEND_ONLY:sources'); END;
