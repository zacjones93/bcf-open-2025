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

type Division = Database["public"]["Enums"]["athlete_division"];

type Athlete = {
	id: string;
	name: string;
	athlete_division: Division | null;
	athlete_teams: Array<{
		team: {
			name: string;
		} | null;
	}>;
};

export async function DivisionGroups() {
	const supabase = await createServerClient();

	const { data: athletes } = await supabase
		.from("athletes")
		.select(
			`
			id,
			name,
			athlete_division,
			athlete_teams!inner (
				team:teams(name)
			)
		`
		)
		.order("name");

	if (!athletes?.length) {
		return (
			<div className="text-center py-4 text-muted-foreground">
				No athletes found
			</div>
		);
	}

	// Group athletes by division, including null division
	const athletesByDivision = athletes.reduce((acc, athlete) => {
		const division = athlete.athlete_division;
		const key = division || "unassigned";
		if (!acc[key]) {
			acc[key] = [];
		}
		acc[key].push(athlete);
		return acc;
	}, {} as Record<string, Athlete[]>);

	// Sort divisions by name, putting unassigned at the end
	const sortedDivisions = Object.keys(athletesByDivision).sort((a, b) => {
		if (a === "unassigned") return 1;
		if (b === "unassigned") return -1;
		if (a.includes("open")) return -1;
		if (b.includes("open")) return 1;
		return a.localeCompare(b);
	});

	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{sortedDivisions.map((division) => (
				<Card key={division}>
					<CardHeader>
						<CardTitle className="text-lg capitalize">
							{division === "unassigned" ? "Unassigned" : division}
						</CardTitle>
						<CardDescription>
							{athletesByDivision[division].length} athlete
							{athletesByDivision[division].length !== 1 ? "s" : ""}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{athletesByDivision[division].map((athlete) => (
								<div
									key={athlete.id}
									className="flex items-center justify-between"
								>
									<div className="flex items-center gap-4">
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
											<p className="text-sm text-muted-foreground">
												{athlete.athlete_teams[0]?.team?.name}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
