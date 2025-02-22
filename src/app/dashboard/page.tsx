import { Suspense } from "react";
import { DashboardCards } from "./_components/dashboard-cards";
import { AssignPointsForm } from "./_components/assign-points-form";
import { AssignWeeklyPointsForm } from "./_components/assign-weekly-points-form";
import { WorkoutCards } from "./_components/workout-cards";
import { LogWorkoutForm } from "./_components/log-workout-form";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import {
	StatsSkeleton,
	WorkoutCardsSkeleton,
	LogWorkoutFormSkeleton,
	AssignPointsFormSkeleton,
} from "./_components/loading-skeletons";

export default function DashboardPage() {
	return (
		<div className="min-h-screen bg-background p-8">
			<div className="mx-auto max-w-7xl space-y-8">
			<div className="space-y-4">
					<h2 id="workouts" className="text-2xl font-bold tracking-tight">
						Workouts
					</h2>
					<Suspense fallback={<WorkoutCardsSkeleton />}>
						<WorkoutCards />
					</Suspense>
				</div>
				<div className="space-y-4">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h2 id="log-score" className="text-2xl font-bold tracking-tight">
								Log Score
							</h2>
							<Button
								asChild
								className="bg-[#dbff43] text-black hover:bg-[#dbff43]/90 font-semibold"
							>
								<a
									href="https://games.crossfit.com/workouts/open/2025"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2"
								>
									Log Score on CrossFit Games
									<ArrowUpRight className="h-4 w-4" />
								</a>
							</Button>
						</div>
					</div>
					<Suspense fallback={<LogWorkoutFormSkeleton />}>
						<LogWorkoutForm />
					</Suspense>
				</div>

				<div className="space-y-4">
					<h2 className="text-2xl font-bold tracking-tight">Stats</h2>
					<Suspense fallback={<StatsSkeleton />}>
						<DashboardCards />
					</Suspense>
				</div>

				

				<div className="space-y-4">
					<Suspense fallback={<AssignPointsFormSkeleton />}>
						<AssignWeeklyPointsForm />
					</Suspense>
					<Suspense fallback={<AssignPointsFormSkeleton />}>
						<AssignPointsForm />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
