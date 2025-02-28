-- Add UPDATE policy for athletes
CREATE POLICY "Athletes can update their own profile"
    ON athletes FOR UPDATE
    TO authenticated
    USING (
        user_id = auth.uid() OR user_id IS NULL
    )
    WITH CHECK (
        user_id = auth.uid()
    ); 