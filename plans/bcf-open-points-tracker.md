# BCF Open Points Tracker Setup

## Prerequisites

1. Node.js v18+ installed ✅ `node -v`
2. pnpm installed ✅ `pnpm -v`
3. Supabase project created and configured ✅

## Database Schema

### Extensions and Settings

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_points ENABLE ROW LEVEL SECURITY;
```

### Tables

1. `teams`

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS Policies
CREATE POLICY "Teams are viewable by authenticated users"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teams are editable by authenticated users"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

2. `athletes`

```sql
CREATE TABLE athletes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  crossfit_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS Policies
CREATE POLICY "Athletes are viewable by authenticated users"
  ON athletes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Athletes are editable by authenticated users"
  ON athletes FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

3. `athlete_teams`

```sql
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

-- RLS Policies
CREATE POLICY "Athlete teams are viewable by authenticated users"
  ON athlete_teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Athlete teams are editable by authenticated users"
  ON athlete_teams FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

4. `workouts`

```sql
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 3),
  workout_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS Policies
CREATE POLICY "Workouts are viewable by authenticated users"
  ON workouts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Workouts are editable by authenticated users"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

5. `point_types`

```sql
CREATE TABLE point_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('weekly', 'one_time', 'performance')),
  points INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS Policies
CREATE POLICY "Point types are viewable by authenticated users"
  ON point_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Point types are editable by authenticated users"
  ON point_types FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

6. `athlete_points`

```sql
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

-- RLS Policies
CREATE POLICY "Athlete points are viewable by authenticated users"
  ON athlete_points FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Athlete points are editable by authenticated users"
  ON athlete_points FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

### Indexes

```sql
-- Add indexes for common queries
CREATE INDEX idx_athlete_teams_athlete_id ON athlete_teams(athlete_id);
CREATE INDEX idx_athlete_teams_team_id ON athlete_teams(team_id);
CREATE INDEX idx_athlete_points_athlete_id ON athlete_points(athlete_id);
CREATE INDEX idx_athlete_points_workout_id ON athlete_points(workout_id);
CREATE INDEX idx_workouts_week_number ON workouts(week_number);
```

### Functions

```sql
-- Auto-update updated_at timestamp
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
```

## Execution Steps

1. Create new Next.js project:

   ```bash
   pnpm create next-app bcf-open-2025 --typescript --tailwind --app --src-dir --import-alias "@/*"
   cd bcf-open-2025
   ```

2. Install dependencies:

   ```bash
   pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs @tanstack/react-query zod @hookform/resolvers/zod react-hook-form
   pnpm add -D @supabase/cli typescript @types/node @types/react @types/react-dom
   ```

3. Install shadcn/ui:

   ```bash
   pnpm dlx shadcn-ui@latest init
   ```

4. Initialize Supabase:

   ```bash
   pnpm supabase init
   ```

5. Create environment variables:

   ```bash
   echo "NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key" > .env.local
   ```

6. Generate types from Supabase schema:

   ```bash
   pnpm supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
   ```

7. Create Supabase client setup:
   ```bash
   mkdir -p src/lib
   ```

## Project Structure

Create the following files:

1. `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

export const createClient = () =>
	createBrowserClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	);
```

2. `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export const createClient = () => {
	const cookieStore = await cookies();

	return createServerClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return cookieStore.get(name)?.value;
				},
				set(name: string, value: string, options: any) {
					try {
						cookieStore.set({ name, value, ...options });
					} catch (error) {
						// Handle cookie errors
					}
				},
				remove(name: string, options: any) {
					try {
						cookieStore.set({ name, value: "", ...options });
					} catch (error) {
						// Handle cookie errors
					}
				},
			},
		}
	);
};
```

3. `src/middleware.ts`:

```typescript
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return request.cookies.get(name)?.value;
				},
				set(name: string, value: string, options: CookieOptions) {
					request.cookies.set({
						name,
						value,
						...options,
					});
					response = NextResponse.next({
						request: {
							headers: request.headers,
						},
					});
					response.cookies.set({
						name,
						value,
						...options,
					});
				},
				remove(name: string, options: CookieOptions) {
					request.cookies.set({
						name,
						value: "",
						...options,
					});
					response = NextResponse.next({
						request: {
							headers: request.headers,
						},
					});
					response.cookies.set({
						name,
						value: "",
						...options,
					});
				},
			},
		}
	);

	await supabase.auth.getSession();

	return response;
}
```

## Validation Checkpoints

1. Verify Next.js setup:

   ```bash
   pnpm run dev
   ```

2. Verify Supabase connection:

   ```typescript
   // In any server component
   const supabase = createClient();
   const { data, error } = await supabase.from("teams").select("*");
   ```

3. Verify type generation:
   ```bash
   pnpm supabase gen types typescript --project-id your-project-id
   ```

## Error Handling

- If Supabase type generation fails:

  ```bash
  pnpm supabase login
  pnpm supabase link --project-ref your-project-id
  pnpm supabase gen types typescript --project-id your-project-id
  ```

- If environment variables are not loading:
  ```bash
  source .env.local
  ```

## Post-Execution

1. Seed initial data:

   ```typescript
   // src/lib/seed.ts
   import { createClient } from "@/lib/supabase/server";

   export async function seedPointTypes() {
   	const supabase = createClient();

   	const pointTypes = [
   		// ... existing point types ...
   	];

   	const { error } = await supabase.from("point_types").insert(pointTypes);

   	if (error) {
   		console.error("Error seeding point types:", error);
   		return;
   	}
   }
   ```

2. Run development server:
   ```bash
   pnpm run dev
   ```

## Initial Data

### Point Types Seed Data

```typescript
const pointTypes = [
	// Weekly Points
	{ name: "Workout Completion", category: "weekly", points: 1 },
	{ name: "Judging/Counting", category: "weekly", points: 1 },
	{ name: "FNL Attendance", category: "weekly", points: 1 },
	{ name: "Personal Record", category: "weekly", points: 1 },
	{ name: "Social Media Post", category: "weekly", points: 1 },

	// One-time Points
	{ name: "Judges Course", category: "one_time", points: 3 },
	{ name: "Spirit of the Open", category: "one_time", points: 5 },

	// Performance Points
	{ name: "First Place", category: "performance", points: 3 },
	{ name: "Second Place", category: "performance", points: 2 },
	{ name: "Third Place", category: "performance", points: 1 },
];
```
