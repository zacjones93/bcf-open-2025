-- Drop existing tables if they exist
DROP TABLE IF EXISTS athlete_points;
DROP TABLE IF EXISTS athlete_teams;
DROP TABLE IF EXISTS athletes;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS workouts;
DROP TABLE IF EXISTS point_types;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE athletes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  crossfit_id VARCHAR(255) UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE athlete_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(athlete_id, team_id, is_active)
);

CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 3),
  workout_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE point_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('weekly', 'one_time', 'performance')),
  points INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE athlete_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  point_type_id UUID REFERENCES point_types(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_athlete_teams_athlete_id ON athlete_teams(athlete_id);
CREATE INDEX idx_athlete_teams_team_id ON athlete_teams(team_id);
CREATE INDEX idx_athlete_points_athlete_id ON athlete_points(athlete_id);
CREATE INDEX idx_athlete_points_workout_id ON athlete_points(workout_id);
CREATE INDEX idx_workouts_week_number ON workouts(week_number);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_points ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Teams are viewable by authenticated users"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teams are editable by authenticated users"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Athletes are viewable by authenticated users"
  ON athletes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Athletes are editable by authenticated users"
  ON athletes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Athlete teams are viewable by authenticated users"
  ON athlete_teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Athlete teams are editable by authenticated users"
  ON athlete_teams FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Workouts are viewable by authenticated users"
  ON workouts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Workouts are editable by authenticated users"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Point types are viewable by authenticated users"
  ON point_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Point types are editable by authenticated users"
  ON point_types FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Athlete points are viewable by authenticated users"
  ON athlete_points FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Athlete points are editable by authenticated users"
  ON athlete_points FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for all tables
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athletes_updated_at
    BEFORE UPDATE ON athletes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athlete_teams_updated_at
    BEFORE UPDATE ON athlete_teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at
    BEFORE UPDATE ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_point_types_updated_at
    BEFORE UPDATE ON point_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athlete_points_updated_at
    BEFORE UPDATE ON athlete_points
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 