"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

interface ScoreInputDialogProps {
	athleteId: string;
	workoutId: string;
	athleteName: string;
	scoringType: "time" | "reps" | "load" | null;
	adminId: string;
}

export function ScoreInputDialog({
	athleteId,
	workoutId,
	athleteName,
	scoringType,
	adminId,
}: ScoreInputDialogProps) {
	const [open, setOpen] = useState(false);
	const [score, setScore] = useState("");
	const [loading, setLoading] = useState(false);
	const supabase = createClient();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Check if score already exists
			const { data: existingScore } = await supabase
				.from("athlete_score")
				.select("id")
				.eq("athlete_id", athleteId)
				.eq("workout_id", workoutId)
				.single();

			if (existingScore) {
				// Update existing score
				const { error } = await supabase
					.from("athlete_score")
					.update({ score })
					.eq("id", existingScore.id);

				if (error) throw error;
			} else {
				// Insert new score
				const { error } = await supabase.from("athlete_score").insert({
					athlete_id: athleteId,
					workout_id: workoutId,
					score,
				});

				if (error) throw error;

				// Get admin's athlete ID
				const { data: adminAthlete, error: adminError } = await supabase
					.from("athletes")
					.select("id")
					.eq("user_id", adminId)
					.single();

				if (adminError) throw adminError;
				if (!adminAthlete) throw new Error("Admin athlete profile not found");

				// Create point assignment
				const { data: pointAssignment, error: assignmentError } = await supabase
					.from("point_assignments")
					.insert({
						assigner_id: adminAthlete.id,
						assignee_id: athleteId,
						point_type_id: "99b7a5f1-c8aa-4282-ade9-cb530aa4cca4", // Workout Completion
						workout_id: workoutId,
						points: 1,
						notes: "admin logged score manually",
					})
					.select()
					.single();

				if (assignmentError) throw assignmentError;
			}

			toast.success(`Score for ${athleteName} has been saved successfully.`);
			setOpen(false);
		} catch (error: any) {
			toast.error(`Failed to save score. Please try again. ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm" className="text-muted-foreground">
					No Score
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Log Score for {athleteName}</DialogTitle>
					<DialogDescription>
						Enter the score for this athlete. The format should match the
						scoring type: {scoringType || "unknown"}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="score">Score</Label>
							<Input
								id="score"
								value={score}
								onChange={(e) => setScore(e.target.value)}
								placeholder={
									scoringType === "time"
										? "MM:SS"
										: scoringType === "load"
										? "Weight in lbs"
										: "Number of reps"
								}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={loading}>
							{loading ? "Saving..." : "Save Score"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
