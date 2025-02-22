import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database.types";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type TeamWithMembers = {
	id: string;
	name: string;
	athlete_teams: Array<{
		athlete: {
			id: string;
			name: string;
		};
	}>;
};

export async function TeamsList() {
	const cookieStore = cookies();
	const supabase = createServerComponentClient<Database>({
		cookies: () => cookieStore,
	});

	// Get all teams with their active members in a single query
	const { data: teamsData } = await supabase
		.from("athlete_teams")
		.select(
			`
			team:team_id (
				id,
				name
			),
			athlete:athlete_id (
				id,
				name
			)
		`
		)
		.eq("is_active", true)
		.order("team_id");

	if (!teamsData?.length) return null;

	// Group athletes by team
	const teamMap = new Map<string, TeamWithMembers>();

	teamsData.forEach((record: any) => {
		if (!record.team || !record.athlete) return;

		const team: TeamWithMembers =
			teamMap.get(record.team.id) ||
			({
				id: record.team.id,
				name: record.team.name,
				athlete_teams: [],
			} as TeamWithMembers);

		team.athlete_teams.push({
			athlete: {
				id: record.athlete.id,
				name: record.athlete.name,
			},
		});

		teamMap.set(record.team.id, team);
	});

	const teams = Array.from(teamMap.values());

	return (
		<div className="grid gap-6">
			{teams.map((team) => (
				<Card key={team.id}>
					<CardHeader>
						<CardTitle>{team.name}</CardTitle>
						<CardDescription>
							{team.athlete_teams.length} member
							{team.athlete_teams.length !== 1 ? "s" : ""}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{team.athlete_teams.map(({ athlete }) => (
								<div key={athlete.id} className="flex items-center gap-4">
									<Avatar>
										<AvatarFallback>
											{athlete.name
												.split(" ")
												.map((n: string) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<p className="font-medium">{athlete.name}</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
