"use client";

import { use, useState } from "react";
import {
	createClient,
	WORKOUT_COMPLETION_POINT_TYPE_ID,
} from "@/lib/supabase/client";
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
import { Workout, AthleteScore } from "@/lib/supabase/queries/server/workouts";

interface LogWorkoutFormProps {
	initialDataLoader: Promise<{
		workout: Workout | null;
		score: AthleteScore | null;
	}>;
}

export function LogWorkoutForm({ initialDataLoader }: LogWorkoutFormProps) {
	const initialData = use(initialDataLoader);
	const { user } = useSupabaseAuth();
	const [score, setScore] = useState(initialData?.score?.score || "");
	const [notes, setNotes] = useState(initialData?.score?.notes || "");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);
	const supabase = createClient();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user || !initialData?.workout) return;

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

			const { data: pointAssignment, error: assignmentError } = await supabase
				.from("point_assignments")
				.upsert(
					{
						assigner_id: athlete.id, // Self-assigned
						assignee_id: athlete.id,
						point_type_id: WORKOUT_COMPLETION_POINT_TYPE_ID, // Workout Completion
						workout_id: initialData.workout.id,
						points: 1,
						notes: "Workout completion points via logged score",
					},
					{
						onConflict: "assignee_id,point_type_id,workout_id",
						ignoreDuplicates: false,
					}
				)
				.select()
				.single();

			if (assignmentError) throw assignmentError;
			if (!pointAssignment)
				throw new Error("Failed to create point assignment");

			// Get or create athlete_point record
			const { data: athletePoint, error: athletePointError } = await supabase
				.from("athlete_points")
				.upsert(
					{
						athlete_id: athlete.id,
						point_type_id: WORKOUT_COMPLETION_POINT_TYPE_ID,
						workout_id: initialData.workout.id,
						points: 1,
						notes: "admin logged score manually",
						point_assignment_id: pointAssignment.id,
					},
					{
						onConflict: "athlete_id,point_type_id,workout_id",
						ignoreDuplicates: false,
					}
				)
				.select("id")
				.single();

			if (athletePointError) {
				console.error("Athlete Point Error Details:", {
					code: athletePointError.code,
					message: athletePointError.message,
					details: athletePointError.details,
					hint: athletePointError.hint,
				});
				throw athletePointError;
			}

			// Use upsert pattern with on_conflict to handle both insert and update cases
			const { error: scoreError } = await supabase.from("athlete_score").upsert(
				{
					workout_id: initialData.workout.id,
					athlete_id: athlete.id,
					score,
					notes: notes || null,
					athlete_point_id: athletePoint.id,
					...(initialData.score ? { id: initialData.score.id } : {}),
				},
				{
					onConflict: "workout_id,athlete_id",
					ignoreDuplicates: false,
				}
			);

			if (scoreError) throw scoreError;

			setSuccess(true);
		} catch (error) {
			setError(error instanceof Error ? error.message : "Failed to save score");
		} finally {
			setLoading(false);
		}
	};

	if (!initialData.workout) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Log Workout Score</CardTitle>
					<CardDescription className="max-w-[300px]">
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
				<CardTitle>
					{initialData.score ? "Update" : "Log"} Workout Score
				</CardTitle>
				<CardDescription>
					{initialData.score
						? `Update your score for ${initialData.workout.name}`
						: `Log your score for ${initialData.workout.name}`}
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
							: initialData.score
							? "Update Score"
							: "Submit Score"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
