-- Add UPDATE policy for athletes
CREATE POLICY "Athletes can update their own profile"
    ON athletes FOR UPDATE
    TO authenticated
    USING (
        user_id = auth.uid()
    )
    WITH CHECK (
        user_id = auth.uid()
    ); 