-- Create point_assignments table
CREATE TABLE point_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assigner_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    point_type_id UUID REFERENCES point_types(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_point_assignments_assigner ON point_assignments(assigner_id);
CREATE INDEX idx_point_assignments_assignee ON point_assignments(assignee_id);

-- Enable RLS
ALTER TABLE point_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Point assignments are viewable by authenticated users"
    ON point_assignments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Point assignments are insertable by authenticated users"
    ON point_assignments FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Add trigger for updating timestamps
CREATE TRIGGER update_point_assignments_updated_at
    BEFORE UPDATE ON point_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 