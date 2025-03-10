-- Migration: Fix athlete_points trigger and RLS issues
-- Purpose: Allow trigger function to bypass RLS and handle upserts properly
-- Date: May 4, 2024

-- First, drop the existing trigger
DROP TRIGGER IF EXISTS create_athlete_points_after_assignment ON point_assignments;

-- Drop the existing function
DROP FUNCTION IF EXISTS create_athlete_points_from_assignment();

-- Create a new function that handles upserts and bypasses RLS
CREATE OR REPLACE FUNCTION create_athlete_points_from_assignment()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO athlete_points (
        athlete_id,
        point_type_id,
        workout_id,
        points,
        notes,
        point_assignment_id
    ) VALUES (
        NEW.assignee_id,
        NEW.point_type_id,
        NEW.workout_id,
        NEW.points,
        NEW.notes,
        NEW.id
    )
    ON CONFLICT (athlete_id, point_type_id, workout_id) 
    DO UPDATE SET
        points = EXCLUDED.points,
        notes = EXCLUDED.notes,
        point_assignment_id = EXCLUDED.point_assignment_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER create_athlete_points_after_assignment
    AFTER INSERT OR UPDATE ON point_assignments
    FOR EACH ROW
    EXECUTE FUNCTION create_athlete_points_from_assignment();

-- Add a policy to allow the trigger function to bypass RLS
CREATE POLICY "Allow trigger function to bypass RLS"
    ON athlete_points
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM point_assignments
            WHERE point_assignments.id = athlete_points.point_assignment_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM point_assignments
            WHERE point_assignments.id = athlete_points.point_assignment_id
        )
    ); 