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
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";

import {
	getAthletesWithTeams,
	getCurrentAthleteTeammates,
	getCurrentAthleteWithTeam,
	isUserAdmin,
} from "@/lib/supabase/queries/server/athletes";
import { getAllPointTypes } from "@/lib/supabase/queries/server/points";
import {
	getAllWorkouts,
	getActiveWorkoutWithScore,
} from "@/lib/supabase/queries/server/workouts";
import { getCachedUser } from "@/lib/supabase/cached-auth";

export default async function DashboardPage() {
	const user = await getCachedUser();

	if (!user) {
		throw new Error("User not found");
	}

	const athletesWithTeamsLoader = getAthletesWithTeams();
	const pointTypesLoader = getAllPointTypes();
	const workoutsLoader = getAllWorkouts();
	const currentAthleteTeammatesLoader = getCurrentAthleteTeammates();
	const currentAthleteLoader = getCurrentAthleteWithTeam();
	const activeWorkoutWithScoreLoader = getActiveWorkoutWithScore(user.id);
	const isAdmin = await isUserAdmin(user.id);

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
						</div>
					</div>
					<Suspense fallback={<LogWorkoutFormSkeleton />}>
						<div className="flex flex-col sm:flex-row gap-4 w-full">
							<LogWorkoutForm
								initialDataLoader={activeWorkoutWithScoreLoader}
							/>
							<Card className="max-w-2xl flex flex-col justify-between">
								<CardHeader>
									<CardTitle>Log Official CrossFit Open Score</CardTitle>
									<CardDescription className="max-w-[300px]">
										You will need to follow the link below to log your official
										open score on the CrossFit Games leaderboard. Clicking the
										link will take you to the submision page.
										<span className="text-sm text-muted-foreground mt-2">
											Scores are due by Monday!
										</span>
									</CardDescription>
								</CardHeader>
								<CardContent className="flex justify-center">
									<Button
										asChild
										className="bg-[#dbff43] text-black hover:bg-[#dbff43]/90 font-semibold w-fit mx-auto"
									>
										<a
											href="https://games.crossfit.com/manage-competition/athlete"
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center justify-center gap-2"
										>
											Log Score on CrossFit Games
											<ArrowUpRight className="h-4 w-4" />
										</a>
									</Button>
								</CardContent>
							</Card>
						</div>
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
						<AssignWeeklyPointsForm
							teammatesLoader={currentAthleteTeammatesLoader}
							currentAthleteLoader={currentAthleteLoader}
							pointTypesLoader={pointTypesLoader}
							workoutsLoader={workoutsLoader}
							isAdmin={isAdmin}
						/>
					</Suspense>
					<Suspense fallback={<AssignPointsFormSkeleton />}>
						<AssignPointsForm
							athletesWithTeamsLoader={athletesWithTeamsLoader}
							pointTypesLoader={pointTypesLoader}
							workoutsLoader={workoutsLoader}
							isAdmin={isAdmin}
						/>
					</Suspense>
				</div>
			</div>
		</div>
	);
}
