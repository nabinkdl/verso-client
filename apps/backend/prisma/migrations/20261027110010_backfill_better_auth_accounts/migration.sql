-- Backfill Better Auth credential accounts from the legacy users.passwordHash column.
INSERT INTO "account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, u."id", 'credential', u."id", u."passwordHash", NOW(), NOW()
FROM "users" u
WHERE u."passwordHash" IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM "account" a
  WHERE a."userId" = u."id" AND a."providerId" = 'credential'
);
