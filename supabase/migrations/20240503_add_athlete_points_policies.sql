-- Migration: Add RLS policies for athlete_points table
-- Purpose: Allow athletes to manage their own points
-- Date: May 3, 2024

-- Enable RLS if not already enabled
ALTER TABLE athlete_points ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Athletes can view their own points" ON athlete_points;
DROP POLICY IF EXISTS "Athletes can insert their own points" ON athlete_points;
DROP POLICY IF EXISTS "Athletes can update their own points" ON athlete_points;
DROP POLICY IF EXISTS "Admins can manage all points" ON athlete_points;

-- Create policies for athletes
CREATE POLICY "Athletes can view their own points"
    ON athlete_points FOR SELECT
    TO authenticated
    USING (
        athlete_id IN (
            SELECT id 
            FROM athletes 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Athletes can insert their own points"
    ON athlete_points FOR INSERT
    TO authenticated
    WITH CHECK (
        athlete_id IN (
            SELECT id 
            FROM athletes 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Athletes can update their own points"
    ON athlete_points FOR UPDATE
    TO authenticated
    USING (
        athlete_id IN (
            SELECT id 
            FROM athletes 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        athlete_id IN (
            SELECT id 
            FROM athletes 
            WHERE user_id = auth.uid()
        )
    );

-- Create policy for admins
CREATE POLICY "Admins can manage all points"
    ON athlete_points FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM athletes
            WHERE athletes.user_id = auth.uid()
            AND athletes.type = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM athletes
            WHERE athletes.user_id = auth.uid()
            AND athletes.type = 'admin'
        )
    ); 