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

export function AssignPointsForm() {
	const { isAdmin, loading: adminLoading } = useIsAdmin();
	const { user } = useSupabaseAuth();
	const [athletes, setAthletes] = useState<Athlete[]>([]);
	const [pointTypes, setPointTypes] = useState<PointType[]>([]);
	const [workouts, setWorkouts] = useState<Workout[]>([]);
	const [selectedAthlete, setSelectedAthlete] = useState("");
	const [selectedPointType, setSelectedPointType] = useState("");
	const [selectedWorkout, setSelectedWorkout] = useState("");
	const [notes, setNotes] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);
	const [athleteSearchOpen, setAthleteSearchOpen] = useState(false);
	const supabase = createClient();

	useEffect(() => {
		async function fetchData() {
			const [athletesResponse, pointTypesResponse, workoutsResponse] =
				await Promise.all([
					supabase.from("athletes").select("id, name").order("name"),
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			const pointType = pointTypes.find((pt) => pt.id === selectedPointType);
			if (!pointType) throw new Error("Invalid point type selected");

			// Get current user's athlete ID
			const { data: currentAthlete } = await supabase
				.from("athletes")
				.select("id")
				.eq("user_id", user?.id ?? "")
				.single();

			if (!currentAthlete) throw new Error("Athlete profile not found");

			// Create point assignment record
			const { data: pointAssignment, error: assignmentError } = await supabase
				.from("point_assignments")
				.insert({
					assigner_id: currentAthlete.id,
					assignee_id: selectedAthlete,
					point_type_id: selectedPointType,
					workout_id: selectedWorkout || null,
					points: pointType.points,
					notes: notes || null,
				})
				.select()
				.single();

			if (assignmentError) throw assignmentError;
			if (!pointAssignment)
				throw new Error("Failed to create point assignment");

			// Create athlete points record
			const { error: pointsError } = await supabase
				.from("athlete_points")
				.insert({
					athlete_id: selectedAthlete,
					point_type_id: selectedPointType,
					workout_id: selectedWorkout || null,
					points: pointType.points,
					notes: notes || null,
					point_assignment_id: pointAssignment.id,
				});

			if (pointsError) throw pointsError;

			setSuccess(true);
			setSelectedAthlete("");
			setSelectedPointType("");
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
						Award points to athletes for their achievements
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
							<Label htmlFor="athlete">Athlete</Label>
							<Popover
								open={athleteSearchOpen}
								onOpenChange={setAthleteSearchOpen}
							>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										aria-expanded={athleteSearchOpen}
										className="w-full justify-between"
									>
										{selectedAthlete
											? athletes.find(
													(athlete) => athlete.id === selectedAthlete
											  )?.name
											: "Select athlete..."}
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-full p-0">
									<Command>
										<CommandInput placeholder="Search athletes..." />
										<CommandEmpty>No athlete found.</CommandEmpty>
										<CommandGroup>
											{athletes.map((athlete) => (
												<CommandItem
													key={athlete.id}
													onSelect={() => {
														console.log("athlete.id", athlete.id);
														setSelectedAthlete(athlete.id);
														setAthleteSearchOpen(false);
													}}
													className="cursor-pointer"
												>
													<Check
														className={cn(
															"mr-2 h-4 w-4",
															selectedAthlete === athlete.id
																? "opacity-100"
																: "opacity-0"
														)}
													/>
													{athlete.name}
												</CommandItem>
											))}
										</CommandGroup>
									</Command>
								</PopoverContent>
							</Popover>
						</div>

						<div className="space-y-2">
							<Label htmlFor="pointType">Point Type</Label>
							<Select
								value={selectedPointType}
								onValueChange={setSelectedPointType}
								required
							>
								<SelectTrigger>
									<SelectValue placeholder="Select point type" />
								</SelectTrigger>
								<SelectContent>
									{["weekly", "one_time", "performance"].map((category) => (
										<div key={category} className="p-2">
											<h4 className="mb-2 font-semibold capitalize">
												{category.replace("_", " ")}
											</h4>
											{pointTypes
												.filter((pt) => pt.category === category)
												.map((pointType) => (
													<SelectItem key={pointType.id} value={pointType.id}>
														{pointType.name} ({pointType.points} points)
													</SelectItem>
												))}
										</div>
									))}
								</SelectContent>
							</Select>
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

						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Assigning Points..." : "Assign Points"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</>
	);
}
