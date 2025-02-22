"use server";

import { createServerClient } from "@/lib/supabase/server";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Database } from "@/types/database.types";

type AthleteWithPoints = {
	id: string;
	name: string;
	total_points: number;
	athlete_division: Database["public"]["Enums"]["athlete_division"] | null;
	athlete_teams: Array<{
		team: {
			name: string;
		} | null;
	}>;
};

export async function TopAthletesCard() {
	const supabase = await createServerClient();

	// Get all athletes with their points
	const { data: athletes } = await supabase
		.from("athletes")
		.select(
			`
			id,
			name,
			athlete_division,
			athlete_teams!inner (
				team:teams(name)
			),
			athlete_points (
				points
			)
		`
		)
		.order("name");

	if (!athletes) return null;

	// Calculate total points for each athlete
	const athletesWithPoints: AthleteWithPoints[] = athletes.map((athlete) => ({
		id: athlete.id,
		name: athlete.name,
		athlete_division: athlete.athlete_division,
		athlete_teams: athlete.athlete_teams,
		total_points:
			athlete.athlete_points?.reduce(
				(sum, point) => sum + (point.points || 0),
				0
			) || 0,
	}));

	// Sort by total points and get top 10
	const topAthletes = athletesWithPoints
		.sort((a, b) => b.total_points - a.total_points)
		.slice(0, 10);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Athlete Leaderboard</CardTitle>
				<CardDescription>top 10 performing athletes</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{topAthletes.map((athlete, index) => (
						<div key={athlete.id} className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-semibold">
									{index + 1}
								</div>
								<Avatar>
									<AvatarFallback>
										{athlete.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<div>
									<p className="font-medium">{athlete.name}</p>
									<div className="flex gap-2 text-sm text-muted-foreground">
										<span>{athlete.athlete_teams[0]?.team?.name}</span>
										<span>•</span>
										<span>{athlete.athlete_division}</span>
									</div>
								</div>
							</div>
							<div className="text-right">
								<p className="text-lg font-semibold">{athlete.total_points}</p>
								<p className="text-sm text-muted-foreground">points</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
