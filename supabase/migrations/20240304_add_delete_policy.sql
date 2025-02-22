-- Add DELETE policy for point_assignments
CREATE POLICY "Point assignments are deletable by admins"
    ON point_assignments FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM athletes
            WHERE athletes.user_id = auth.uid()
            AND athletes.type = 'admin'
        )
    ); 