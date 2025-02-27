"use client";

import { use, useState } from "react";
import { useSupabaseAuth } from "@/components/providers/supabase-auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AthleteWithTeams } from "@/lib/supabase/queries/server/athletes";

interface Athlete {
	id: string;
	name: string;
}

interface PointType {
	id: string;
	name: string;
	category: string;
	points: number;
}

interface Workout {
	id: string;
	name: string;
	week_number: number;
}

interface AssignWeeklyPointsFormProps {
	teammatesLoader: Promise<AthleteWithTeams[]>;
	currentAthleteLoader: Promise<AthleteWithTeams>;
	pointTypesLoader: Promise<PointType[]>;
	workoutsLoader: Promise<Workout[]>;
}

export function AssignWeeklyPointsForm({ teammatesLoader, currentAthleteLoader, pointTypesLoader, workoutsLoader }: AssignWeeklyPointsFormProps) {
	const teammates = use(teammatesLoader);
	const currentAthlete = use(currentAthleteLoader);
	const isCaptain = currentAthlete.type === "captain" || currentAthlete.type === "admin";

	const pointTypes = use(pointTypesLoader);
	const filteredPointTypes = pointTypes.filter((pt) => pt.category === "weekly");
	const workouts = use(workoutsLoader);

	const { user } = useSupabaseAuth();
	const supabase = createClient();

	const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
	const [selectedPointTypes, setSelectedPointTypes] = useState<string[]>([]);
	const [selectedWorkout, setSelectedWorkout] = useState("");
	const [notes, setNotes] = useState("");
	
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			// Get current athlete ID (captain assigning points)
			const { data: captain } = await supabase
				.from("athletes")
				.select("id")
				.eq("user_id", user.id)
				.single();

			if (!captain) {
				throw new Error("Captain profile not found");
			}

			// Create point assignments for each selected athlete and point type combination
			const pointAssignments = selectedAthletes.flatMap((athleteId) =>
				selectedPointTypes.map((pointTypeId) => ({
					assigner_id: captain.id,
					assignee_id: athleteId,
					point_type_id: pointTypeId,
					workout_id: selectedWorkout || null,
					notes: notes || null,
				}))
			);

			const { data: createdAssignments, error: insertError } = await supabase
				.from("point_assignments")
				.insert(pointAssignments)
				.select();

			if (insertError) throw insertError;
			if (!createdAssignments)
				throw new Error("Failed to create point assignments");

			// Create athlete points records for each assignment
			const athletePoints = createdAssignments.map((assignment) => ({
				athlete_id: assignment.assignee_id,
				point_type_id: assignment.point_type_id,
				workout_id: selectedWorkout || null,
				points:
					filteredPointTypes.find((pt) => pt.id === assignment.point_type_id)?.points ||
					0,
				notes: notes || null,
				point_assignment_id: assignment.id,
			}));

			const { error: pointsError } = await supabase
				.from("athlete_points")
				.insert(athletePoints);

			if (pointsError) throw pointsError;

			setSuccess(true);
			setSelectedAthletes([]);
			setSelectedPointTypes([]);
			setSelectedWorkout("");
			setNotes("");
		} catch (error) {
			console.error("Error assigning points:", error);
			setError(
				error instanceof Error ? error.message : "Failed to assign points"
			);
		} finally {
			setLoading(false);
		}
	};

	if (!isCaptain) {
		return null;
	}

	return (
		<>
			<h2 className="text-2xl font-bold tracking-tight">Captain Actions</h2>
			<Card className="max-w-2xl">
				<CardHeader>
					<CardTitle>Assign Weekly Points</CardTitle>
					<CardDescription>
						Award points for weekly achievements like judging, FNL attendance,
						or PRs
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
								<AlertDescription>
									Points assigned successfully!
								</AlertDescription>
							</Alert>
						)}

						<div className="space-y-2">
							<Label>Athletes</Label>
							<div className="space-y-2 border rounded-md p-4 max-h-[200px] overflow-y-auto">
								{teammates.map((athlete) => (
									<div key={athlete.id} className="flex items-center space-x-2">
										<Checkbox
											id={`athlete-${athlete.id}`}
											checked={selectedAthletes.includes(athlete.id)}
											onCheckedChange={(checked: boolean) => {
												setSelectedAthletes(
													checked
														? [...selectedAthletes, athlete.id]
														: selectedAthletes.filter((id) => id !== athlete.id)
												);
											}}
										/>
										<Label
											htmlFor={`athlete-${athlete.id}`}
											className="cursor-pointer"
										>
											{athlete.name}
										</Label>
									</div>
								))}
							</div>
						</div>

						<div className="space-y-2">
							<Label>Point Types</Label>
							<div className="space-y-2 border rounded-md p-4">
								{filteredPointTypes.map((type) => (
									<div key={type.id} className="flex items-center space-x-2">
										<Checkbox
											id={type.id}
											checked={selectedPointTypes.includes(type.id)}
											onCheckedChange={(checked: boolean) => {
												setSelectedPointTypes(
													checked
														? [...selectedPointTypes, type.id]
														: selectedPointTypes.filter((id) => id !== type.id)
												);
											}}
										/>
										<Label htmlFor={type.id} className="cursor-pointer">
											{type.name} ({type.points} point
											{type.points !== 1 ? "s" : ""})
										</Label>
									</div>
								))}
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="workout">Workout</Label>
							<Select
								value={selectedWorkout}
								onValueChange={setSelectedWorkout}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select workout..." />
								</SelectTrigger>
								<SelectContent>
									{workouts.map((workout) => (
										<SelectItem key={workout.id} value={workout.id}>
											{workout.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="notes">Notes (Optional)</Label>
							<Textarea
								id="notes"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Add any additional notes..."
							/>
						</div>

						<Button
							type="submit"
							disabled={
								loading ||
								selectedAthletes.length === 0 ||
								selectedPointTypes.length === 0
							}
							className="w-full"
						>
							{loading ? "Assigning Points..." : "Assign Points"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</>
	);
}
