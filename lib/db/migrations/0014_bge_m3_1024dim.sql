-- Upgrade embedding column from vector(768) to vector(1024) for BGE-M3.
-- All existing chunks must be deleted — 768-dim vectors cannot be cast to 1024-dim
-- and are in a different embedding space. Re-embed documents via the dashboard
-- (Documents tab → Re-index button on each document) after deploying this migration.

-- Step 1: Drop the HNSW index (required before altering the column type)
DROP INDEX IF EXISTS "document_chunks_embedding_hnsw_idx";

--> statement-breakpoint

-- Step 2: Delete stale 768-dim chunks
DELETE FROM "document_chunks";

--> statement-breakpoint

-- Step 3: Change column type to 1024 dimensions
ALTER TABLE "document_chunks" ALTER COLUMN "embedding" TYPE vector(1024);

--> statement-breakpoint

-- Step 4: Recreate the HNSW index for 1024-dim cosine similarity
CREATE INDEX "document_chunks_embedding_hnsw_idx" ON "document_chunks" USING hnsw ("embedding" vector_cosine_ops) WITH (m = 16, ef_construction = 64);
