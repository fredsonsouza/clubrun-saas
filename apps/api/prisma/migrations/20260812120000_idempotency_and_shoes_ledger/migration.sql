-- Forward-only idempotency and shoe mileage ledger.
BEGIN;

CREATE TYPE "IdempotencyStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

CREATE TABLE idempotency_records (
  id TEXT NOT NULL,
  principal_key TEXT NOT NULL,
  scope TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  status "IdempotencyStatus" NOT NULL DEFAULT 'PROCESSING',
  response_code INTEGER,
  resource_id TEXT,
  locked_until TIMESTAMP(3),
  expires_at TIMESTAMP(3) NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL,
  CONSTRAINT idempotency_records_pkey PRIMARY KEY (id),
  CONSTRAINT idempotency_records_user_fkey
    FOREIGN KEY (principal_key) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idempotency_records_principal_scope_key
  ON idempotency_records (principal_key, scope, key_hash);
CREATE INDEX idempotency_records_expires_at_idx
  ON idempotency_records (expires_at);

CREATE TYPE "ShoesMileageEntryKind" AS ENUM ('DEBIT', 'CREDIT');

CREATE TABLE shoes_mileage_entries (
  id TEXT NOT NULL,
  athlete_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  distance_km DOUBLE PRECISION NOT NULL,
  kind "ShoesMileageEntryKind" NOT NULL DEFAULT 'DEBIT',
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT shoes_mileage_entries_pkey PRIMARY KEY (id),
  CONSTRAINT shoes_mileage_entries_distance_check CHECK (distance_km > 0),
  CONSTRAINT shoes_mileage_entries_athlete_fkey
    FOREIGN KEY (athlete_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX shoes_mileage_entries_source_key
  ON shoes_mileage_entries (source_type, source_id);
CREATE INDEX shoes_mileage_entries_athlete_created_idx
  ON shoes_mileage_entries (athlete_id, created_at);

ALTER TABLE invoices
  ALTER COLUMN amount TYPE DECIMAL(12, 2)
  USING amount::DECIMAL(12, 2);

COMMIT;
