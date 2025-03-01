-- STEP 1: First, let's identify if we have any duplicates
-- This query will show you how many duplicates exist for each combination
SELECT 
    assignee_id, 
    point_type_id, 
    workout_id, 
    COUNT(*) as duplicate_count
FROM 
    point_assignments
GROUP BY 
    assignee_id, point_type_id, workout_id
HAVING 
    COUNT(*) > 1
ORDER BY 
    duplicate_count DESC;

-- STEP 2: View the actual duplicate records (if any were found above)
-- This will show all the duplicate records with their details
WITH duplicates AS (
    SELECT 
        *,
        ROW_NUMBER() OVER (
            PARTITION BY assignee_id, point_type_id, workout_id 
            ORDER BY created_at DESC
        ) as row_num
    FROM 
        point_assignments
)
SELECT 
    id, 
    assignee_id, 
    point_type_id, 
    workout_id, 
    points,
    notes,
    created_at,
    row_num
FROM 
    duplicates 
WHERE 
    row_num > 1;

-- STEP 3: Delete the duplicates (keeping only the most recent record)
-- IMPORTANT: Review the results from steps 1 and 2 before running this!
-- Uncomment the following code when you're ready to delete duplicates:

/*
WITH duplicates AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY assignee_id, point_type_id, workout_id 
            ORDER BY created_at DESC
        ) as row_num
    FROM 
        point_assignments
)
DELETE FROM 
    point_assignments
WHERE 
    id IN (
        SELECT id FROM duplicates WHERE row_num > 1
    );

-- Confirm how many records were deleted
SELECT 'Duplicates removed successfully. The unique constraint can now be added.' as message;
*/

-- STEP 4: Add the unique constraint (after cleaning up duplicates)
-- Uncomment this when you're ready to add the constraint:

/*
ALTER TABLE point_assignments 
ADD CONSTRAINT unique_point_assignment 
UNIQUE (assignee_id, point_type_id, workout_id);

COMMENT ON CONSTRAINT unique_point_assignment ON point_assignments IS 
'Ensures each athlete can only have one point assignment of a specific type for a specific workout';

SELECT 'Unique constraint added successfully.' as message;
*/ 