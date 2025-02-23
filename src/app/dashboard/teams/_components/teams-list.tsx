import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database.types";
import Image from "next/image";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type TeamResponse = Database["public"]["Tables"]["teams"]["Row"] & {
	athlete_teams: Array<{
		athlete: {
			id: string;
			name: string;
			type: Database["public"]["Enums"]["athlete type"] | null;
			athlete_points: Array<{
				points: number;
			}> | null;
		} | null;
		is_active: boolean | null;
	}>;
};

type TeamWithMembers = {
	id: string;
	name: string;
	totalPoints: number;
	captain: {
		id: string;
		name: string;
		points: number;
	} | null;
	athlete_teams: Array<{
		athlete: {
			id: string;
			name: string;
			points: number;
		};
	}>;
};

function getTeamLogo(teamName: string): string {
	const normalizedName = teamName.toLowerCase().trim();
	if (normalizedName.includes("blue-tang clan"))
		return "/images/blue-tang-clan.png";
	if (normalizedName.includes("apsey-lute domination"))
		return "/images/apsey-lute-domination.png";
	if (normalizedName.includes("team black")) return "/images/team-black.png";
	return "";
}

export async function TeamsList() {
	const cookieStore = cookies();
	const supabase = createServerComponentClient<Database>({
		cookies: () => cookieStore,
	});

	// Get all teams with their active members, captains, and points in a single query
	const { data: teamsData } = await supabase
		.from("teams")
		.select(
			`
			*,
			athlete_teams!team_id (
				athlete:athlete_id (
					id,
					name,
					type,
					athlete_points (
						points
					)
				),
				is_active
			)
		`
		)
		.eq("athlete_teams.is_active", true)
		.returns<TeamResponse[]>();

	console.log({ teamsData });

	if (!teamsData?.length) return null;

	// Transform the data to match our TeamWithMembers type
	const teams: TeamWithMembers[] = teamsData.map((team) => {
		// Find the captain
		const captainTeam = team.athlete_teams.find(
			(at) => at.athlete?.type === "captain"
		);
		const captain = captainTeam?.athlete
			? {
					id: captainTeam.athlete.id,
					name: captainTeam.athlete.name,
					points:
						captainTeam.athlete.athlete_points?.reduce(
							(sum, p) => sum + p.points,
							0
						) || 0,
			  }
			: null;

		// Filter out captain from athlete teams and transform data
		const athleteTeams = team.athlete_teams
			.filter(
				(
					at
				): at is typeof at & { athlete: NonNullable<(typeof at)["athlete"]> } =>
					at.athlete !== null && at.athlete.type !== "captain"
			)
			.map((at) => ({
				athlete: {
					id: at.athlete.id,
					name: at.athlete.name,
					points:
						at.athlete.athlete_points?.reduce((sum, p) => sum + p.points, 0) ||
						0,
				},
			}));

		// Calculate total team points (including captain)
		const totalPoints = [
			...athleteTeams,
			...(captain ? [{ athlete: captain }] : []),
		].reduce((sum, at) => sum + at.athlete.points, 0);

		return {
			id: team.id,
			name: team.name,
			totalPoints,
			captain,
			athlete_teams: athleteTeams,
		};
	});

	// Sort teams by total points
	teams.sort((a, b) => b.totalPoints - a.totalPoints);

	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{teams.map((team) => {
				const teamLogo = getTeamLogo(team.name);
				return (
					<Card key={team.id}>
						<CardHeader>
							{teamLogo && (
								<div className="mb-4 flex justify-center">
									<Image
										src={teamLogo}
										alt={team.name}
										width={200}
										height={200}
										className="rounded-lg"
									/>
								</div>
							)}
							<CardTitle className="flex items-baseline justify-between">
								<span>{team.name}</span>
								<span className="font-mono text-sm">
									{team.totalPoints} pts
								</span>
							</CardTitle>
							<CardDescription>
								{team.athlete_teams.length} member
								{team.athlete_teams.length !== 1 ? "s" : ""}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{/* Captain Section */}
								<div className="border-b pb-2">
									<p className="text-sm font-medium text-muted-foreground mb-2">
										Captain
									</p>
									{team.captain ? (
										<div className="flex items-center gap-4">
											<Avatar>
												<AvatarFallback>
													{team.captain.name
														.split(" ")
														.map((n: string) => n[0])
														.join("")}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1 flex items-baseline justify-between">
												<p className="font-medium">{team.captain.name}</p>
												<p className="font-mono text-sm">
													{team.captain.points} pts
												</p>
											</div>
										</div>
									) : (
										<p className="text-sm text-muted-foreground">
											No captain assigned
										</p>
									)}
								</div>
								{/* Team Members */}
								<div>
									<p className="text-sm font-medium text-muted-foreground mb-2">
										Team Members
									</p>
									<div className="space-y-2">
										{team.athlete_teams
											.sort((a, b) => b.athlete.points - a.athlete.points)
											.map(({ athlete }) => (
												<div
													key={athlete.id}
													className="flex items-center gap-4"
												>
													<Avatar>
														<AvatarFallback>
															{athlete.name
																.split(" ")
																.map((n: string) => n[0])
																.join("")}
														</AvatarFallback>
													</Avatar>
													<div className="flex-1 flex items-baseline justify-between">
														<p className="font-medium">{athlete.name}</p>
														<p className="font-mono text-sm">
															{athlete.points} pts
														</p>
													</div>
												</div>
											))}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
