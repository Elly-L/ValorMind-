-- Remove the unique constraint that prevents multiple entries per day
-- This allows users to create multiple journal entries on the same date

-- Drop the existing unique constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'journal_entries_user_id_entry_date_key'
    ) THEN
        ALTER TABLE journal_entries DROP CONSTRAINT journal_entries_user_id_entry_date_key;
    END IF;
END $$;

-- Add a new column to store the time when the entry was created (more granular than just date)
-- This helps distinguish between multiple entries on the same day
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' AND column_name = 'entry_datetime'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN entry_datetime TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        -- Update existing entries to have entry_datetime based on their entry_date
        UPDATE journal_entries 
        SET entry_datetime = entry_date::timestamp + created_at::time
        WHERE entry_datetime IS NULL;
    END IF;
END $$;

-- Create a new index for better performance on the new structure
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_datetime ON journal_entries(user_id, entry_datetime DESC);

-- Drop the old index since we're no longer using the unique constraint
DROP INDEX IF EXISTS idx_journal_entries_user_date;
