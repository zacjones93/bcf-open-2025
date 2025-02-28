import { createServerClient } from "@/lib/supabase/server";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WorkoutFilterClient } from "./workout-filter-client";
import type { Database } from "@/types/database.types";

type Division = Database["public"]["Enums"]["athlete_division"];
type ScoringType = Database["public"]["Enums"]["scoring_type"];

type Workout = {
	id: string;
	name: string;
	scoring_type: ScoringType | null;
	week_number: number;
};

type AthleteScore = {
	id: number;
	score: string | null;
	workout_id: string;
};

type Athlete = {
	id: string;
	name: string;
	athlete_division: Division | null;
	athlete_teams: Array<{
		team: {
			name: string;
		} | null;
	}>;
	athlete_scores?: AthleteScore[];
};

interface DivisionGroupsProps {
	selectedWorkoutId?: string;
}

export async function DivisionGroups({
	selectedWorkoutId,
}: DivisionGroupsProps) {
	const supabase = await createServerClient();

	// Fetch all workouts for the filter
	const { data: workouts } = await supabase
		.from("workouts")
		.select("id, name, scoring_type, week_number, workout_date")
		.order("week_number", { ascending: false });

	// Find the workout closest to the current date if none is selected
	const currentWorkoutId =
		selectedWorkoutId || findClosestWorkout(workouts || []);

	// Get the current workout details for sorting logic
	const currentWorkout = workouts?.find((w) => w.id === currentWorkoutId);

	// Helper function to find the workout closest to the current date
	function findClosestWorkout(
		workouts: Array<{ id: string; workout_date: string }>
	): string | undefined {
		if (!workouts.length) return undefined;

		const today = new Date();
		let closestWorkout = workouts[0];
		let smallestDiff = Infinity;

		for (const workout of workouts) {
			const workoutDate = new Date(workout.workout_date);
			const timeDiff = Math.abs(workoutDate.getTime() - today.getTime());

			if (timeDiff < smallestDiff) {
				smallestDiff = timeDiff;
				closestWorkout = workout;
			}
		}

		return closestWorkout.id;
	}

	// Fetch athletes with their scores for the selected workout
	const { data: athletes } = await supabase
		.from("athletes")
		.select(
			`
			id,
			name,
			athlete_division,
			athlete_teams!inner (
				team:teams(name)
			),
			athlete_scores:athlete_score(
				id,
				score,
				workout_id
			)
		`
		)
		.order("name");

	if (!athletes?.length) {
		return (
			<div className="space-y-4">
				<WorkoutFilterClient
					workouts={workouts || []}
					currentWorkoutId={currentWorkoutId}
				/>
				<div className="text-center py-4 text-muted-foreground">
					No athletes found
				</div>
			</div>
		);
	}

	// Group athletes by division, including null division
	const athletesByDivision = athletes.reduce((acc, athlete) => {
		const division = athlete.athlete_division;
		const key = division || "unassigned";
		if (!acc[key]) {
			acc[key] = [];
		}
		acc[key].push(athlete);
		return acc;
	}, {} as Record<string, Athlete[]>);

	// Sort divisions by name, putting unassigned at the end
	const sortedDivisions = Object.keys(athletesByDivision).sort((a, b) => {
		if (a === "unassigned") return 1;
		if (b === "unassigned") return -1;
		if (a.includes("open")) return -1;
		if (b.includes("open")) return 1;
		return a.localeCompare(b);
	});

	// Sort athletes within each division based on their scores
	for (const division of sortedDivisions) {
		const athletes = athletesByDivision[division];

		// Sort athletes by their scores for the current workout
		athletes.sort((a, b) => {
			// Find scores for the current workout
			const scoreA = a.athlete_scores?.find(
				(s) => s.workout_id === currentWorkoutId
			)?.score;
			const scoreB = b.athlete_scores?.find(
				(s) => s.workout_id === currentWorkoutId
			)?.score;

			// If either athlete doesn't have a score, put them at the bottom
			if (!scoreA && !scoreB) return 0;
			if (!scoreA) return 1;
			if (!scoreB) return -1;

			// Parse scores based on scoring type
			if (currentWorkout?.scoring_type === "time") {
				// For time: lower is better (convert to seconds for comparison)
				const secondsA = parseTimeToSeconds(scoreA);
				const secondsB = parseTimeToSeconds(scoreB);
				return secondsA - secondsB;
			} else {
				// For reps or load: higher is better
				const numA = parseFloat(scoreA) || 0;
				const numB = parseFloat(scoreB) || 0;
				return numB - numA; // Descending order
			}
		});
	}

	return (
		<div className="space-y-6">
			<WorkoutFilterClient
				workouts={workouts || []}
				currentWorkoutId={currentWorkoutId}
			/>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{sortedDivisions.map((division) => (
					<Card key={division}>
						<CardHeader>
							<CardTitle className="text-lg capitalize">
								{division === "unassigned" ? "Unassigned" : division}
							</CardTitle>
							<CardDescription>
								{athletesByDivision[division].length} athlete
								{athletesByDivision[division].length !== 1 ? "s" : ""}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{/* Athletes with scores */}
								{athletesByDivision[division]
									.filter((athlete) =>
										athlete.athlete_scores?.some(
											(s) => s.workout_id === currentWorkoutId && s.score
										)
									)
									.map((athlete) => {
										const score = athlete.athlete_scores?.find(
											(s) => s.workout_id === currentWorkoutId
										)?.score;

										return (
											<div
												key={athlete.id}
												className="flex items-center justify-between"
											>
												<div className="flex items-center gap-4">
													<Avatar>
														<AvatarFallback>
															{athlete.name
																.split(" ")
																.map((n) => n[0])
																.join("")}
														</AvatarFallback>
													</Avatar>
													<div>
														<p className="font-medium">{athlete.name}</p>
														<p className="text-sm text-muted-foreground">
															{athlete.athlete_teams[0]?.team?.name}
														</p>
													</div>
												</div>
												<div className="font-mono font-medium">{score}</div>
											</div>
										);
									})}

								{/* Divider if there are both scored and unscored athletes */}
								{athletesByDivision[division].some((a) =>
									a.athlete_scores?.some(
										(s) => s.workout_id === currentWorkoutId && s.score
									)
								) &&
									athletesByDivision[division].some(
										(a) =>
											!a.athlete_scores?.some(
												(s) => s.workout_id === currentWorkoutId && s.score
											)
									) && (
										<div className="py-2">
											<div className="relative">
												<div className="absolute inset-0 flex items-center">
													<span className="w-full border-t" />
												</div>
												<div className="relative flex justify-center text-xs">
													<span className="bg-card px-2 text-muted-foreground">
														No Score
													</span>
												</div>
											</div>
										</div>
									)}

								{/* Athletes without scores */}
								{athletesByDivision[division]
									.filter(
										(athlete) =>
											!athlete.athlete_scores?.some(
												(s) => s.workout_id === currentWorkoutId && s.score
											)
									)
									.map((athlete) => (
										<div
											key={athlete.id}
											className="flex items-center justify-between opacity-60"
										>
											<div className="flex items-center gap-4">
												<Avatar>
													<AvatarFallback>
														{athlete.name
															.split(" ")
															.map((n) => n[0])
															.join("")}
													</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-medium">{athlete.name}</p>
													<p className="text-sm text-muted-foreground">
														{athlete.athlete_teams[0]?.team?.name}
													</p>
												</div>
											</div>
											<div className="text-sm text-muted-foreground">
												No score
											</div>
										</div>
									))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

// Helper function to parse time strings (e.g., "12:34") to seconds
function parseTimeToSeconds(timeStr: string): number {
	if (!timeStr) return 0;

	// Handle different time formats
	if (timeStr.includes(":")) {
		const parts = timeStr.split(":");
		if (parts.length === 2) {
			// MM:SS format
			return parseInt(parts[0]) * 60 + parseInt(parts[1]);
		} else if (parts.length === 3) {
			// HH:MM:SS format
			return (
				parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
			);
		}
	}

	// Try to parse as a number of seconds
	return parseFloat(timeStr) || 0;
}
