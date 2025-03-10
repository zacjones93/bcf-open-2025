-- Migration: Fix admin policies for athlete_score table
-- Purpose: Allow admins to manage any athlete's score
-- Date: May 5, 2024

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can insert any athlete score" ON athlete_score;
DROP POLICY IF EXISTS "Admins can update any athlete score" ON athlete_score;

-- Create new admin policies that check for admin type
CREATE POLICY "Admins can insert any athlete score"
    ON athlete_score FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM athletes
            WHERE athletes.user_id = auth.uid()
            AND athletes.type = 'admin'
        )
    );

CREATE POLICY "Admins can update any athlete score"
    ON athlete_score FOR UPDATE
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

-- Add delete policy for admins
CREATE POLICY "Admins can delete any athlete score"
    ON athlete_score FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM athletes
            WHERE athletes.user_id = auth.uid()
            AND athletes.type = 'admin'
        )
    ); 