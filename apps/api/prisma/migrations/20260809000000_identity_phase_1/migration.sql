-- Identity core, phase 1 (forward-only).
-- IMPORTANT: every legacy token is intentionally invalidated below. Legacy `code`
-- values cannot be migrated safely into digests and did not carry expiry metadata.

BEGIN;

-- Abort before changing data if normalizing user e-mails would create collisions.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM users
    GROUP BY lower(btrim(email))
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot normalize users.email: case/whitespace collisions exist';
  END IF;
END $$;

-- Abort before changing data if normalizing invite e-mails would violate the
-- existing per-club uniqueness invariant.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM invites
    GROUP BY club_id, lower(btrim(email))
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot normalize invites.email: per-club case/whitespace collisions exist';
  END IF;
END $$;

UPDATE users SET email = lower(btrim(email)) WHERE email <> lower(btrim(email));
UPDATE invites SET email = lower(btrim(email)) WHERE email <> lower(btrim(email));

ALTER TABLE users
  ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0,
  ADD CONSTRAINT users_email_normalized_check CHECK (email = lower(btrim(email)));

ALTER TABLE invites
  ADD CONSTRAINT invites_email_normalized_check CHECK (email = lower(btrim(email)));

-- Functional indexes provide defense in depth if a check is temporarily disabled
-- during maintenance/imports. The original Prisma unique constraints remain.
CREATE UNIQUE INDEX users_email_normalized_key
  ON users (lower(btrim(email)));
CREATE UNIQUE INDEX invites_club_id_email_normalized_key
  ON invites (club_id, lower(btrim(email)));
CREATE INDEX invites_email_normalized_idx
  ON invites (lower(btrim(email)));

-- SECURITY: invalidate/delete every token issued by the legacy plaintext/code
-- implementation. This forces fresh verification and recovery issuance.
DELETE FROM tokens;

ALTER TABLE tokens
  DROP COLUMN code,
  ADD COLUMN digest TEXT NOT NULL,
  ADD COLUMN expires_at TIMESTAMP(3) NOT NULL,
  ADD COLUMN consumed_at TIMESTAMP(3),
  ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0,
  ADD CONSTRAINT tokens_attempts_nonnegative_check CHECK (attempts >= 0);

CREATE UNIQUE INDEX tokens_digest_key ON tokens(digest);
CREATE INDEX tokens_user_id_type_expires_at_idx
  ON tokens(user_id, type, expires_at);

CREATE TABLE oauth_attempts (
  id TEXT NOT NULL,
  state_digest TEXT NOT NULL,
  pkce_challenge TEXT NOT NULL,
  expires_at TIMESTAMP(3) NOT NULL,
  consumed_at TIMESTAMP(3),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT oauth_attempts_pkey PRIMARY KEY (id)
);

CREATE UNIQUE INDEX oauth_attempts_state_digest_key
  ON oauth_attempts(state_digest);

COMMIT;
