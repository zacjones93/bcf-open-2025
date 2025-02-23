"use client";

import { useEffect, useState } from "react";
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

export function AssignWeeklyPointsForm() {
	const { user } = useSupabaseAuth();
	const supabase = createClient();

	const [athletes, setAthletes] = useState<Athlete[]>([]);
	const [pointTypes, setPointTypes] = useState<PointType[]>([]);
	const [workouts, setWorkouts] = useState<Workout[]>([]);
	const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
	const [selectedPointTypes, setSelectedPointTypes] = useState<string[]>([]);
	const [selectedWorkout, setSelectedWorkout] = useState("");
	const [notes, setNotes] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isCaptain, setIsCaptain] = useState(false);

	useEffect(() => {
		async function fetchData() {
			if (!user) return;

			try {
				// Check if user is a captain or admin
				const { data: currentAthlete } = await supabase
					.from("athletes")
					.select(
						`
						id,
						type,
						athlete_teams!inner (
							team:teams(*)
						)
					`
					)
					.eq("user_id", user.id)
					.single();

				if (
					currentAthlete?.type !== "admin" &&
					currentAthlete?.type !== "captain"
				) {
					return;
				}

				setIsCaptain(true);

				// Get the captain's team
				const captainTeamId = currentAthlete.athlete_teams[0]?.team?.id;

				if (!captainTeamId) {
					setError("No team found for captain");
					return;
				}

				// Get athletes from the same team
				const { data: teamAthletes, error: athletesError } = await supabase
					.from("athletes")
					.select(
						`
						id,
						name,
						athlete_teams!inner (
							team:teams!inner(*)
						)
					`
					)
					.eq("athlete_teams.team_id", captainTeamId)
					.neq("id", currentAthlete.id) // Exclude the captain
					.order("name");

				if (athletesError) throw athletesError;

				// Fetch point types
				const { data: pointTypesData, error: pointTypesError } = await supabase
					.from("point_types")
					.select("*")
					.eq("category", "weekly")
					.order("name");

				if (pointTypesError) throw pointTypesError;

				// Fetch workouts
				const { data: workoutsData, error: workoutsError } = await supabase
					.from("workouts")
					.select("*")
					.order("week_number");

				if (workoutsError) throw workoutsError;

				setAthletes(teamAthletes || []);
				setPointTypes(pointTypesData || []);
				setWorkouts(workoutsData || []);
			} catch (error) {
				console.error("Error fetching data:", error);
				setError("Failed to load form data");
			}
		}

		fetchData();
	}, [user, supabase]);

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
					pointTypes.find((pt) => pt.id === assignment.point_type_id)?.points ||
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
								{athletes.map((athlete) => (
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
								{pointTypes.map((type) => (
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
