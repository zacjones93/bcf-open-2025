import { createServerClient } from "@/lib/supabase/server";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { TeamPointsChart } from "./team-points-chart";
import { WorkoutCompletionCharts } from "./workout-completion-charts";
import { TopAthletesCard } from "./top-athletes-card";

interface TeamWithAthletes {
	id: string;
	name: string;
	athlete_teams: Array<{
		athlete: {
			id: string;
			name: string;
		};
	}>;
}

interface WorkoutScore {
	id: number;
	workout_id: string;
	athlete_id: string | null;
	athlete_points: Array<{
		athlete_id: string | null;
		workout_id: string | null;
		points: number;
		point_type: {
			category: string;
		};
	}> | null;
}

export async function DashboardCards() {
	const supabase = await createServerClient();

	// Get all teams with their active members
	const { data: teamsData } = await supabase
		.from("athlete_teams")
		.select(
			`
			team:team_id (
				id,
				name
			),
			athlete:athlete_id (
				id,
				name
			)
		`
		)
		.eq("is_active", true)
		.order("team_id");

	if (!teamsData?.length) return null;

	// Group athletes by team
	const teamMap = new Map<string, TeamWithAthletes>();

	teamsData.forEach((record: any) => {
		if (!record.team || !record.athlete) return;

		const team: TeamWithAthletes =
			teamMap.get(record.team.id) ||
			({
				id: record.team.id,
				name: record.team.name,
				athlete_teams: [],
			} as TeamWithAthletes);

		team.athlete_teams.push({
			athlete: {
				id: record.athlete.id,
				name: record.athlete.name,
			},
		});

		teamMap.set(record.team.id, team);
	});

	const teams = Array.from(teamMap.values());

	// Get all workout scores
	const { data: workoutScores } = await supabase.from("athlete_score").select(`
			id,
			workout_id,
			athlete_id
		`);

	// Get all athlete points
	const { data: athletePoints } = await supabase.from("athlete_points").select(`
			athlete_id,
			workout_id,
			points,
			point_type:point_types!inner (
				category
			)
		`);

	// Combine the data
	const combinedScores = workoutScores?.map((score) => ({
		...score,
		athlete_points:
			athletePoints?.filter(
				(point) =>
					point.athlete_id === score.athlete_id &&
					point.workout_id === score.workout_id
			) || null,
	})) as WorkoutScore[] | null;

	// Calculate team points
	const teamPoints = teams.map((team) => ({
		name: team.name,
		total:
			athletePoints?.reduce((sum, point) => {
				// Check if this point belongs to an athlete in this team
				const isTeamMember = team.athlete_teams.some(
					(at) => at.athlete.id === point.athlete_id
				);

				if (isTeamMember) {
					return sum + (point.points || 0);
				}
				return sum;
			}, 0) || 0,
	}));

	// Sort teams by points for better visualization
	const sortedTeamPoints = teamPoints.sort((a, b) => b.total - a.total);

	// Get workout completion data
	const { data: workouts } = await supabase
		.from("workouts")
		.select("id, name, week_number")
		.order("week_number");

	const workoutCompletionData = workouts?.map((workout) => ({
		workoutId: workout.id,
		workoutName: workout.name,
		teams: teams.map((team) => {
			// Get all points for this workout and team
			const teamWorkoutPoints = athletePoints?.filter(
				(point) =>
					point.workout_id === workout.id &&
					team.athlete_teams.some((at) => at.athlete.id === point.athlete_id)
			);

			// Count unique athletes who completed the workout
			const completedAthletes = new Set(
				teamWorkoutPoints?.map((point) => point.athlete_id)
			).size;

			return {
				name: team.name,
				totalAthletes: team.athlete_teams.length,
				completedAthletes,
				points:
					teamWorkoutPoints?.reduce(
						(sum, point) => sum + (point.points || 0),
						0
					) || 0,
			};
		}),
	}));

	return (
		<div className="space-y-8">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{teams.map((team) => (
					<Card key={team.id}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{team.name}</CardTitle>
							<span className="text-sm text-muted-foreground">
								{team.athlete_teams.length} athletes
							</span>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{teamPoints.find((tp) => tp.name === team.name)?.total || 0}
							</div>
							<p className="text-xs text-muted-foreground">points</p>
						</CardContent>
					</Card>
				))}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Team Performance</CardTitle>
				</CardHeader>
				<CardContent className="h-[300px]">
					<TeamPointsChart data={sortedTeamPoints} />
				</CardContent>
			</Card>

			<div className="space-y-4">
				<h3 className="text-lg font-semibold">Workout Completion</h3>
				<WorkoutCompletionCharts data={workoutCompletionData || []} />
			</div>

			<div className="space-y-4">
				<h3 className="text-lg font-semibold">Leaderboard</h3>
				<TopAthletesCard />
			</div>
		</div>
	);
}
