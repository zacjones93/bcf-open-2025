import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/types/database.types";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
	const supabase = await createClient();

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
		<div className="grid gap-4 md:grid-cols-3 auto-rows-fr">
			{mergedWorkouts.map((workout) =>
				"id" in workout ? (
					<Link
						href={`/workouts/${workout.id}`}
						key={workout.name}
						className="block"
					>
						<Card
							className={cn(
								"group transition-all hover:border-primary active:scale-[0.98] h-full",
								"hover:shadow-md active:shadow-sm",
								"touch-none", // Prevents sticky hover on mobile
								"@media (hover: none) { &:active { transform: scale(0.98); } }" // Ensures scale works on touch devices
							)}
						>
							<CardHeader className="flex gap-2 pb-2">
								<div className="flex flex-row items-center justify-between gap-2">
									<CardTitle className="text-sm font-medium flex items-center gap-2">
										{workout.name}
										<ArrowUpRight className="h-4 w-4 transition-all opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
									</CardTitle>
									<p className="text-sm text-muted-foreground">
										Week {workout.week_number}
									</p>
								</div>
								<p className="text-sm text-muted-foreground">{workout.date}</p>
							</CardHeader>
							<CardContent className="flex items-center justify-center min-h-[200px] relative">
								<p className="text-sm font-medium text-center whitespace-pre-wrap">
									{workout.description || "Tap to view workout details"}
								</p>
								<div className="absolute inset-0" />
							</CardContent>
						</Card>
					</Link>
				) : (
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
				)
			)}
		</div>
	);
}
