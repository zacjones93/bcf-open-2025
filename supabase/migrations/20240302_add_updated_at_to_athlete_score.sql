-- Add updated_at column to athlete_score table
ALTER TABLE athlete_score ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add trigger for updating timestamps
CREATE TRIGGER update_athlete_score_updated_at
    BEFORE UPDATE ON athlete_score
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 