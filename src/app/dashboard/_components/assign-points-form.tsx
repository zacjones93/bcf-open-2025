"use client";

import { useState, use } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { type AthleteWithTeams } from "@/lib/supabase/queries/server/athletes";
import { type PointType } from "@/lib/supabase/queries/server/points";
import { type Workout } from "@/lib/supabase/queries/server/workouts";

interface AssignPointsFormProps {
	athletesWithTeamsLoader: Promise<AthleteWithTeams[]>;
	pointTypesLoader: Promise<PointType[]>;
	workoutsLoader: Promise<Workout[]>;
	isAdmin: boolean;
}

export function AssignPointsForm({
	athletesWithTeamsLoader,
	pointTypesLoader,
	workoutsLoader,
	isAdmin,
}: AssignPointsFormProps) {
	const athletesWithTeams = use(athletesWithTeamsLoader);
	const pointTypes = use(pointTypesLoader);
	const workouts = use(workoutsLoader);

	const { user } = useSupabaseAuth();
	const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
	const [selectedPointTypes, setSelectedPointTypes] = useState<string[]>([]);
	const [selectedWorkout, setSelectedWorkout] = useState("");
	const [selectedTeam, setSelectedTeam] = useState<string>("all");
	const [notes, setNotes] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);
	const supabase = createClient();

	// Get unique teams from athletes
	const teams = Array.from(
		new Set(
			athletesWithTeams
				.flatMap((athlete) =>
					athlete.athlete_teams.map((at) => at.team?.name).filter(Boolean)
				)
				.filter((name): name is string => name !== undefined)
		)
	).sort();

	// Filter athletes by selected team
	const filteredAthletes = athletesWithTeams.filter((athlete) =>
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
					.upsert(pointAssignments, {
						onConflict: "assignee_id,point_type_id,workout_id",
						ignoreDuplicates: false,
					})
					.select();

			if (assignmentError) throw assignmentError;
			if (!createdAssignments)
				throw new Error("Failed to create point assignments");

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
