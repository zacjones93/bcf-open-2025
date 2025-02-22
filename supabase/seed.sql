-- Seed teams
INSERT INTO teams (name) VALUES
  ('Team Red'),
  ('Team Blue'),
  ('Team Green');

-- Seed point types
INSERT INTO point_types (name, category, points) VALUES
  -- Weekly Points
  ('Workout Completion', 'weekly', 1),
  ('Judging/Counting', 'weekly', 1),
  ('FNL Attendance', 'weekly', 1),
  ('Personal Record', 'weekly', 1),
  ('Social Media Post', 'weekly', 1),
  
  -- One-time Points
  ('Judges Course', 'one_time', 3),
  ('Spirit of the Open', 'one_time', 5),
  
  -- Performance Points
  ('First Place', 'performance', 3),
  ('Second Place', 'performance', 2),
  ('Third Place', 'performance', 1);

-- Seed workouts
INSERT INTO workouts (name, week_number, workout_date) VALUES
  ('Open Workout 25.1', 1, '2025-02-28'),
  ('Open Workout 25.2', 2, '2025-03-07'),
  ('Open Workout 25.3', 3, '2025-03-14'); 