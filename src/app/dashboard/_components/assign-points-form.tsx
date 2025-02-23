"use client";

import { useState, useEffect } from "react";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useSupabaseAuth } from "@/components/providers/supabase-auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface Athlete {
	id: string;
	name: string;
	athlete_teams: Array<{
		team: {
			id: string;
			name: string;
		} | null;
	}>;
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

export function AssignPointsForm() {
	const { isAdmin, loading: adminLoading } = useIsAdmin();
	const { user } = useSupabaseAuth();
	const [athletes, setAthletes] = useState<Athlete[]>([]);
	const [pointTypes, setPointTypes] = useState<PointType[]>([]);
	const [workouts, setWorkouts] = useState<Workout[]>([]);
	const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
	const [selectedPointTypes, setSelectedPointTypes] = useState<string[]>([]);
	const [selectedWorkout, setSelectedWorkout] = useState("");
	const [selectedTeam, setSelectedTeam] = useState<string>("all");
	const [notes, setNotes] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);
	const supabase = createClient();

	useEffect(() => {
		async function fetchData() {
			const [athletesResponse, pointTypesResponse, workoutsResponse] =
				await Promise.all([
					supabase
						.from("athletes")
						.select(
							`
						id, 
						name,
						athlete_teams!inner (
							team:teams(
								id,
								name
							)
						)
					`
						)
						.order("name"),
					supabase.from("point_types").select("*").order("category, name"),
					supabase.from("workouts").select("*").order("week_number"),
				]);

			if (athletesResponse.error) setError("Failed to load athletes");
			else setAthletes(athletesResponse.data);

			if (pointTypesResponse.error) setError("Failed to load point types");
			else setPointTypes(pointTypesResponse.data);

			if (workoutsResponse.error) setError("Failed to load workouts");
			else setWorkouts(workoutsResponse.data);
		}

		fetchData();
	}, [supabase]);

	// Get unique teams from athletes
	const teams = Array.from(
		new Set(
			athletes
				.flatMap((athlete) =>
					athlete.athlete_teams.map((at) => at.team?.name).filter(Boolean)
				)
				.filter((name): name is string => name !== undefined)
		)
	).sort();

	// Filter athletes by selected team
	const filteredAthletes = athletes.filter((athlete) =>
		selectedTeam === "all"
			? true
			: athlete.athlete_teams.some((at) => at.team?.name === selectedTeam)
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			// Get current user's athlete ID
			const { data: currentAthlete } = await supabase
				.from("athletes")
				.select("id")
				.eq("user_id", user?.id ?? "")
				.single();

			if (!currentAthlete) throw new Error("Athlete profile not found");

			// Create point assignments for each selected athlete and point type combination
			const pointAssignments = selectedAthletes.flatMap((athleteId) =>
				selectedPointTypes.map((pointTypeId) => ({
					assigner_id: currentAthlete.id,
					assignee_id: athleteId,
					point_type_id: pointTypeId,
					workout_id: selectedWorkout || null,
					points: pointTypes.find((pt) => pt.id === pointTypeId)?.points || 0,
					notes: notes || null,
				}))
			);

			const { data: createdAssignments, error: assignmentError } =
				await supabase
					.from("point_assignments")
					.insert(pointAssignments)
					.select();

			if (assignmentError) throw assignmentError;
			if (!createdAssignments)
				throw new Error("Failed to create point assignments");

			// Create athlete points records for each assignment
			const athletePoints = createdAssignments.map((assignment) => ({
				athlete_id: assignment.assignee_id,
				point_type_id: assignment.point_type_id,
				workout_id: selectedWorkout || null,
				points: assignment.points,
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
			setError(
				error instanceof Error ? error.message : "Failed to assign points"
			);
		} finally {
			setLoading(false);
		}
	};

	if (adminLoading) return null;
	if (!isAdmin) return null;

	return (
		<>
			<h2 className="text-2xl font-bold tracking-tight">Admin</h2>
			<Card className="max-w-2xl mb-20">
				<CardHeader>
					<CardTitle>Assign Points</CardTitle>
					<CardDescription>
						Award points to multiple athletes for their achievements
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
							<Label>Filter by Team</Label>
							<Select value={selectedTeam} onValueChange={setSelectedTeam}>
								<SelectTrigger>
									<SelectValue placeholder="Select team..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Teams</SelectItem>
									{teams.map((team) => (
										<SelectItem key={team} value={team}>
											{team}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>Athletes</Label>
							<div className="space-y-2 border rounded-md p-4 max-h-[200px] overflow-y-auto">
								{filteredAthletes.map((athlete) => (
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
								{["weekly", "one_time", "performance"].map((category) => (
									<div key={category} className="space-y-2">
										<h4 className="font-semibold capitalize">
											{category.replace("_", " ")}
										</h4>
										{pointTypes
											.filter((pt) => pt.category === category)
											.map((type) => (
												<div
													key={type.id}
													className="flex items-center space-x-2 ml-4"
												>
													<Checkbox
														id={`point-type-${type.id}`}
														checked={selectedPointTypes.includes(type.id)}
														onCheckedChange={(checked: boolean) => {
															setSelectedPointTypes(
																checked
																	? [...selectedPointTypes, type.id]
																	: selectedPointTypes.filter(
																			(id) => id !== type.id
																	  )
															);
														}}
													/>
													<Label
														htmlFor={`point-type-${type.id}`}
														className="cursor-pointer"
													>
														{type.name} ({type.points} point
														{type.points !== 1 ? "s" : ""})
													</Label>
												</div>
											))}
									</div>
								))}
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="workout">Workout (Optional)</Label>
							<Select
								value={selectedWorkout}
								onValueChange={setSelectedWorkout}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select workout" />
								</SelectTrigger>
								<SelectContent>
									{workouts.map((workout) => (
										<SelectItem key={workout.id} value={workout.id}>
											{workout.name} (Week {workout.week_number})
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
								placeholder="Add any relevant notes about these points"
							/>
						</div>

						<Button
							type="submit"
							className="w-full"
							disabled={
								loading ||
								selectedAthletes.length === 0 ||
								selectedPointTypes.length === 0
							}
						>
							{loading ? "Assigning Points..." : "Assign Points"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</>
	);
}
