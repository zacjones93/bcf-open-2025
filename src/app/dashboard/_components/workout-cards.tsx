import { createServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/types/database.types";

type Workout = Database["public"]["Tables"]["workouts"]["Row"];

const placeholderWorkouts = [
	{
		name: "Open Workout 25.1",
		week_number: 1,
		date: "February 28, 2025",
		description: "Coming soon...",
	},
	{
		name: "Open Workout 25.2",
		week_number: 2,
		date: "March 7, 2025",
		description: "Coming soon...",
	},
	{
		name: "Open Workout 25.3",
		week_number: 3,
		date: "March 14, 2025",
		description: "Coming soon...",
	},
];

export async function WorkoutCards() {
	const supabase = await createServerClient();

	const { data: workouts } = await supabase
		.from("workouts")
		.select("*")
		.order("week_number");

	// Merge database workouts with placeholders
	const mergedWorkouts = placeholderWorkouts.map((placeholder) => {
		const dbWorkout = workouts?.find(
			(w: Workout) => w.name === placeholder.name
		);
		if (!dbWorkout) return placeholder;

		return {
			...dbWorkout,
			date: new Date(dbWorkout.workout_date).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			}),
		};
	});

	return (
		<div className="grid gap-4 md:grid-cols-3">
			{mergedWorkouts.map((workout) => (
				<Card key={workout.name}>
					<CardHeader className="flex gap-2 pb-2">
						<div className="flex flex-row items-center justify-between gap-2">
							<CardTitle className="text-sm font-medium">
								{workout.name}
							</CardTitle>
							<p className="text-sm text-muted-foreground">
								Week {workout.week_number}
							</p>
						</div>
						<p className="text-sm text-muted-foreground">{workout.date}</p>
					</CardHeader>
					<CardContent className="flex items-center justify-center min-h-[200px]">
						<p className="text-sm font-medium">{workout.description}</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
