"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import type { Database } from "@/types/database.types";

type ScoringType = Database["public"]["Enums"]["scoring_type"];

type Workout = {
	id: string;
	name: string;
	scoring_type: ScoringType | null;
	week_number: number;
};

interface WorkoutFilterClientProps {
	workouts: Workout[];
	currentWorkoutId?: string;
}

export function WorkoutFilterClient({
	workouts,
	currentWorkoutId,
}: WorkoutFilterClientProps) {
	const router = useRouter();

	const handleWorkoutChange = (value: string) => {
		// Navigate to the same page with the selected workout as a query parameter
		router.push(`/dashboard/divisions?workout=${value}`);
	};

	return (
		<div className="flex justify-end">
			<div className="w-[250px]">
				<Select
					name="workout"
					defaultValue={currentWorkoutId}
					onValueChange={handleWorkoutChange}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select workout" />
					</SelectTrigger>
					<SelectContent>
						{workouts.map((workout) => (
							<SelectItem key={workout.id} value={workout.id}>
								Week {workout.week_number}: {workout.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
