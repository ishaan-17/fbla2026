-- ============================================================================
-- "I Lost Something" Feature - Database Migration
-- Run this in Supabase SQL Editor
-- ============================================================================

-- 1. Enable pgvector extension for embedding storage
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to existing items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS image_embedding vector(512);

-- 3. Create lost_items table
CREATE TABLE IF NOT EXISTS lost_items (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  location_lost TEXT,
  date_lost DATE,
  image_path TEXT,
  image_embedding vector(512),  -- CLIP embedding dimension
  ai_tags JSONB,
  reporter_name TEXT,
  reporter_email TEXT NOT NULL,
  status TEXT DEFAULT 'searching',  -- searching, matched, closed
  notified_at TIMESTAMPTZ  -- when user was notified of matches
);

-- 4. Create item_matches table
CREATE TABLE IF NOT EXISTS item_matches (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  lost_item_id INTEGER REFERENCES lost_items(id) ON DELETE CASCADE,
  found_item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  image_similarity REAL DEFAULT 0,     -- 0-1 score from embedding comparison
  text_similarity REAL DEFAULT 0,      -- 0-1 score from description/tags
  category_match BOOLEAN DEFAULT FALSE,
  total_score REAL DEFAULT 0,          -- weighted combination
  status TEXT DEFAULT 'pending',       -- pending, notified, confirmed, rejected
  UNIQUE(lost_item_id, found_item_id)
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lost_items_status ON lost_items(status);
CREATE INDEX IF NOT EXISTS idx_lost_items_email ON lost_items(reporter_email);
CREATE INDEX IF NOT EXISTS idx_lost_items_category ON lost_items(category);
CREATE INDEX IF NOT EXISTS idx_item_matches_lost_id ON item_matches(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_item_matches_found_id ON item_matches(found_item_id);
CREATE INDEX IF NOT EXISTS idx_item_matches_score ON item_matches(total_score DESC);

-- 6. Create vector similarity index (for fast embedding search)
-- Using IVFFlat index for approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS idx_items_embedding ON items 
  USING ivfflat (image_embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_lost_items_embedding ON lost_items 
  USING ivfflat (image_embedding vector_cosine_ops) WITH (lists = 100);

-- 7. Enable Row Level Security
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_matches ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for lost_items
-- Allow anyone to insert (submit lost item reports)
CREATE POLICY "Anyone can submit lost items" ON lost_items
  FOR INSERT WITH CHECK (true);

-- Allow users to view their own lost items
CREATE POLICY "Users can view own lost items" ON lost_items
  FOR SELECT USING (true);  -- Public for now, can restrict later

-- Allow service role to update
CREATE POLICY "Service role can update lost items" ON lost_items
  FOR UPDATE USING (true);

-- 9. RLS Policies for item_matches
CREATE POLICY "Anyone can view matches" ON item_matches
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage matches" ON item_matches
  FOR ALL USING (true);

-- 10. Function to find matching items using vector similarity
CREATE OR REPLACE FUNCTION find_matching_items(
  query_embedding vector(512),
  query_category TEXT,
  similarity_threshold REAL DEFAULT 0.5,
  max_results INT DEFAULT 10
)
RETURNS TABLE (
  item_id INT,
  title TEXT,
  description TEXT,
  category TEXT,
  image_path TEXT,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.title,
    i.description,
    i.category,
    i.image_path,
    1 - (i.image_embedding <=> query_embedding) AS similarity
  FROM items i
  WHERE i.status = 'approved'
    AND i.image_embedding IS NOT NULL
    AND (query_category IS NULL OR i.category = query_category)
    AND 1 - (i.image_embedding <=> query_embedding) >= similarity_threshold
  ORDER BY i.image_embedding <=> query_embedding
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- 11. Function to find matching lost items for a found item
CREATE OR REPLACE FUNCTION find_matching_lost_items(
  query_embedding vector(512),
  query_category TEXT,
  similarity_threshold REAL DEFAULT 0.5,
  max_results INT DEFAULT 10
)
RETURNS TABLE (
  lost_item_id INT,
  title TEXT,
  description TEXT,
  category TEXT,
  image_path TEXT,
  reporter_email TEXT,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.description,
    l.category,
    l.image_path,
    l.reporter_email,
    1 - (l.image_embedding <=> query_embedding) AS similarity
  FROM lost_items l
  WHERE l.status = 'searching'
    AND l.image_embedding IS NOT NULL
    AND (query_category IS NULL OR l.category = query_category)
    AND 1 - (l.image_embedding <=> query_embedding) >= similarity_threshold
  ORDER BY l.image_embedding <=> query_embedding
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;
