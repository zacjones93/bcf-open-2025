-- Migration: Add unique constraint to point_assignments table
-- Purpose: Prevent duplicate point assignments for the same athlete, point type, and workout
-- Date: May 1, 2024

-- First, clean up any existing duplicates
-- This keeps only the most recently created record for each unique combination
WITH duplicates AS (
    SELECT 
        id,
        assignee_id,
        point_type_id,
        workout_id,
        ROW_NUMBER() OVER (
            PARTITION BY assignee_id, point_type_id, workout_id 
            ORDER BY created_at DESC
        ) as row_num
    FROM point_assignments
)
DELETE FROM point_assignments
WHERE id IN (
    SELECT id FROM duplicates WHERE row_num > 1
);

-- Now add the unique constraint
ALTER TABLE point_assignments 
ADD CONSTRAINT unique_point_assignment 
UNIQUE (assignee_id, point_type_id, workout_id);

-- Add a comment explaining the constraint
COMMENT ON CONSTRAINT unique_point_assignment ON point_assignments IS 
'Ensures each athlete can only have one point assignment of a specific type for a specific workout'; 