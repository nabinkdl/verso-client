-- Legacy hashes were backfilled into "account".password; the column is no longer used.
ALTER TABLE "users" DROP COLUMN "passwordHash";
