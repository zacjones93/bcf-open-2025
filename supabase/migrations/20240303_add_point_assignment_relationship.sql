-- Add point_assignment_id column to athlete_points
ALTER TABLE athlete_points 
ADD COLUMN point_assignment_id UUID REFERENCES point_assignments(id) ON DELETE CASCADE;

-- Create index for the new foreign key
CREATE INDEX idx_athlete_points_point_assignment_id ON athlete_points(point_assignment_id);

-- Update existing athlete_points records to match with point_assignments
-- This will match records based on athlete_id, point_type_id, and workout_id
UPDATE athlete_points ap
SET point_assignment_id = pa.id
FROM point_assignments pa
WHERE ap.athlete_id = pa.assignee_id
  AND ap.point_type_id = pa.point_type_id
  AND COALESCE(ap.workout_id, '00000000-0000-0000-0000-000000000000') = COALESCE(pa.workout_id, '00000000-0000-0000-0000-000000000000');

-- Add a trigger to automatically create athlete_points when point_assignments are created
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
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_athlete_points_after_assignment
    AFTER INSERT ON point_assignments
    FOR EACH ROW
    EXECUTE FUNCTION create_athlete_points_from_assignment(); 