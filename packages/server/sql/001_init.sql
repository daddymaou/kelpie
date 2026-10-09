-- Kelpie server schema (append-only log + materialized rows)

CREATE TABLE IF NOT EXISTS sequence_state (
	name TEXT PRIMARY KEY,
	last_value BIGINT NOT NULL
);

INSERT INTO sequence_state (name, last_value)
VALUES ('mutation_log', 0)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS mutation_log (
	id TEXT PRIMARY KEY,
	seq BIGINT NOT NULL,
	table_name TEXT NOT NULL,
	row_id TEXT NOT NULL,
	op TEXT NOT NULL,
	device_id TEXT NOT NULL,
	schema_version BIGINT NOT NULL,
	wall_time BIGINT NOT NULL,
	hlc_counter BIGINT NOT NULL,
	hlc_device_id TEXT NOT NULL,
	mutation JSONB NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS mutation_log_seq_unique ON mutation_log (seq);
CREATE INDEX IF NOT EXISTS mutation_log_seq_idx ON mutation_log (seq);

CREATE TABLE IF NOT EXISTS materialized_rows (
	key TEXT PRIMARY KEY,
	table_name TEXT NOT NULL,
	row_id TEXT NOT NULL,
	value JSONB NOT NULL,
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS materialized_rows_table_idx ON materialized_rows (table_name);
