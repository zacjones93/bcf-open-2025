-- Add admin policies for athlete_score table
CREATE POLICY "Admins can insert any athlete score"
    ON athlete_score FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM athletes
            WHERE athletes.user_id = auth.uid()
            AND athletes.is_admin = true
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
            AND athletes.is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM athletes
            WHERE athletes.user_id = auth.uid()
            AND athletes.is_admin = true
        )
    ); 