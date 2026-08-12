-- Forward-only ownership invariants.
BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM clubs c
    LEFT JOIN members m
      ON m.club_id = c.id
     AND m.user_id = c.owner_id
     AND m.role = 'OWNER'
     AND m.status = 'ACTIVE'
    WHERE m.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot enforce ownership invariant: club owner membership is missing or inactive';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM members
    WHERE role = 'OWNER'
    GROUP BY club_id
    HAVING count(*) <> 1
  ) THEN
    RAISE EXCEPTION 'Cannot enforce ownership invariant: club has zero or multiple OWNER memberships';
  END IF;
END $$;

CREATE UNIQUE INDEX members_one_owner_per_club_key
  ON members (club_id)
  WHERE role = 'OWNER';

CREATE UNIQUE INDEX clubs_owner_membership_key
  ON members (club_id, user_id)
  WHERE role = 'OWNER' AND status = 'ACTIVE';

COMMIT;
