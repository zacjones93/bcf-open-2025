"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/components/providers/supabase-auth-provider";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

interface Workout {
	id: string;
	name: string;
	week_number: number;
	workout_date: string;
}

interface AthleteScore {
	id: number;
	score: string | null;
	notes: string | null;
	workout_id: string;
	athlete_id: string;
}

export function LogWorkoutForm() {
	const { user } = useSupabaseAuth();
	const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
	const [existingScore, setExistingScore] = useState<AthleteScore | null>(null);
	const [score, setScore] = useState("");
	const [notes, setNotes] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);
	const supabase = createClient();

	useEffect(() => {
		async function fetchData() {
			if (!user) return;

			// Get current athlete ID
			const { data: athlete } = await supabase
				.from("athletes")
				.select("id")
				.eq("user_id", user.id)
				.single();

			if (!athlete) {
				setError("Athlete profile not found");
				return;
			}

			// Get active workout
			const now = new Date();
			const { data: workouts } = await supabase
				.from("workouts")
				.select("*")
				.lte("workout_date", now.toISOString())
				.order("workout_date", { ascending: false })
				.limit(1);

			const workout = workouts?.[0];
			if (workout) {
				const workoutDate = new Date(workout.workout_date);
				const cutoffDate = new Date(workoutDate);
				cutoffDate.setDate(cutoffDate.getDate() + 3);

				if (now <= cutoffDate) {
					setActiveWorkout(workout);

					// Check for existing score
					const { data: score } = await supabase
						.from("athlete_score")
						.select("*")
						.eq("workout_id", workout.id)
						.eq("athlete_id", athlete.id)
						.single();

					if (score) {
						setExistingScore({
							...score,
							athlete_id: athlete.id,
						});
						setScore(score.score || "");
						setNotes(score.notes || "");
					}
				}
			}
		}

		fetchData();
	}, [user, supabase]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user || !activeWorkout) return;

		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			// Get current athlete ID
			const { data: athlete, error: athleteError } = await supabase
				.from("athletes")
				.select("id")
				.eq("user_id", user.id)
				.maybeSingle();

			if (athleteError) throw athleteError;
			if (!athlete)
				throw new Error(
					"Athlete profile not found. Please complete your profile setup first."
				);

			if (existingScore) {
				// Update existing score
				const { error: scoreError } = await supabase
					.from("athlete_score")
					.update({ score, notes: notes || null })
					.eq("id", existingScore.id)
					.eq("athlete_id", athlete.id);

				if (scoreError) throw scoreError;
			} else {
				// Create new score
				const { error: scoreError } = await supabase
					.from("athlete_score")
					.insert({
						workout_id: activeWorkout.id,
						athlete_id: athlete.id,
						score,
						notes: notes || null,
					});

				if (scoreError) throw scoreError;

				// Create point assignment record for workout completion
				const { data: pointAssignment, error: assignmentError } = await supabase
					.from("point_assignments")
					.insert({
						assigner_id: athlete.id, // Self-assigned
						assignee_id: athlete.id,
						point_type_id: "99b7a5f1-c8aa-4282-ade9-cb530aa4cca4", // Workout Completion
						workout_id: activeWorkout.id,
						points: 1,
						notes: "Workout completion points via logged score",
					})
					.select()
					.single();

				if (assignmentError) throw assignmentError;
				if (!pointAssignment)
					throw new Error("Failed to create point assignment");

				// Award completion points
				const { error: pointsError } = await supabase
					.from("athlete_points")
					.insert({
						athlete_id: athlete.id,
						point_type_id: "99b7a5f1-c8aa-4282-ade9-cb530aa4cca4", // Workout Completion
						workout_id: activeWorkout.id,
						points: 1,
						point_assignment_id: pointAssignment.id,
					});

				if (pointsError) throw pointsError;
			}

			setSuccess(true);
			if (!existingScore) {
				setExistingScore({
					id: 0, // Will be updated on next fetch
					score,
					notes,
					workout_id: activeWorkout.id,
					athlete_id: athlete.id,
				});
			}
		} catch (error) {
			setError(error instanceof Error ? error.message : "Failed to save score");
		} finally {
			setLoading(false);
		}
	};

	if (!activeWorkout) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Log Workout Score</CardTitle>
					<CardDescription>
						Score logging is currently closed. Check back when the next workout
						is released.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card className="max-w-2xl">
			<CardHeader>
				<CardTitle>{existingScore ? "Update" : "Log"} Workout Score</CardTitle>
				<CardDescription>
					{existingScore
						? `Update your score for ${activeWorkout.name}`
						: `Log your score for ${activeWorkout.name}`}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					{success && (
						<Alert>
							<AlertDescription>Score saved successfully!</AlertDescription>
						</Alert>
					)}

					<div className="space-y-2">
						<Label htmlFor="score">Score</Label>
						<Input
							id="score"
							value={score}
							onChange={(e) => setScore(e.target.value)}
							placeholder="Enter your score"
							required
						/>
					</div>

					<div className="space-y-2">
						<div className="flex flex-col gap-2">
							<Label htmlFor="notes">Notes (Optional)</Label>
							<span className="text-sm text-muted-foreground">
								Did you PR? How did this go?
							</span>
						</div>
						<Textarea
							id="notes"
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Add any notes about your performance"
							className="min-h-[100px]"
						/>
					</div>

					<Button type="submit" className="w-full" disabled={loading}>
						{loading
							? "Saving..."
							: existingScore
							? "Update Score"
							: "Submit Score"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
