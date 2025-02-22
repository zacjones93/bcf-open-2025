-- Create athlete_score table if it doesn't exist
CREATE TABLE IF NOT EXISTS athlete_score (
    id SERIAL PRIMARY KEY,
    workoutId UUID REFERENCES workouts(id) ON DELETE CASCADE,
    score TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_athlete_score_workout_id ON athlete_score(workoutId);
CREATE INDEX IF NOT EXISTS idx_athlete_score_athlete_id ON athlete_score(athlete_id);

-- Enable Row Level Security
ALTER TABLE athlete_score ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Athletes can view all scores"
    ON athlete_score FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Athletes can insert their own scores"
    ON athlete_score FOR INSERT
    TO authenticated
    WITH CHECK (
        athlete_id IN (
            SELECT id 
            FROM athletes 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Athletes can update their own scores"
    ON athlete_score FOR UPDATE
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

-- Add trigger for updating timestamps
CREATE TRIGGER update_athlete_score_updated_at
    BEFORE UPDATE ON athlete_score
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 