-- Migration: Add unique constraint to athlete_points table
-- Purpose: Prevent duplicate athlete points for the same athlete, point type, and workout
-- Date: May 2, 2024

-- First, clean up any existing duplicates
-- This keeps only the most recently created record for each unique combination
WITH duplicates AS (
    SELECT 
        id,
        athlete_id,
        point_type_id,
        workout_id,
        ROW_NUMBER() OVER (
            PARTITION BY athlete_id, point_type_id, workout_id 
            ORDER BY created_at DESC
        ) as row_num
    FROM athlete_points
)
DELETE FROM athlete_points
WHERE id IN (
    SELECT id FROM duplicates WHERE row_num > 1
);

-- Now add the unique constraint
ALTER TABLE athlete_points 
ADD CONSTRAINT unique_athlete_point 
UNIQUE (athlete_id, point_type_id, workout_id);

-- Add a comment explaining the constraint
COMMENT ON CONSTRAINT unique_athlete_point ON athlete_points IS 
'Ensures each athlete can only have one point record of a specific type for a specific workout'; 