"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import type { Database } from "@/types/database.types";
import type { User } from "@supabase/supabase-js";
import type { AthleteWithTeams } from "@/lib/supabase/queries/server/athletes";

type Division =
	| Database["public"]["Enums"]["athlete_division"]
	| null
	| undefined;

interface Team {
	id: string;
	name: string;
	captain?: {
		name: string;
	} | null;
}

interface OnboardingClientProps {
	user: User;
	teams: Team[];
	unassignedAthletes: AthleteWithTeams[];
	claimAthleteProfile?: (
		formData: FormData
	) => Promise<{ success?: boolean; error?: string }>;
}

const divisions: { value: Division; label: string }[] = [
	{ value: "open (m)", label: "Open (Men)" },
	{ value: "open (f)", label: "Open (Women)" },
	{ value: "scaled (m)", label: "Scaled (Men)" },
	{ value: "scaled (f)", label: "Scaled (Women)" },
	{ value: "masters (55+ m)", label: "Masters 55+ (Men)" },
	{ value: "masters (55+ f)", label: "Masters 55+ (Women)" },
];

export default function OnboardingClient({
	user,
	teams,
	unassignedAthletes,
	claimAthleteProfile,
}: OnboardingClientProps) {
	const router = useRouter();
	const supabase = createClient();

	const [name, setName] = useState("");
	const [crossfitId, setCrossfitId] = useState("");
	const [teamId, setTeamId] = useState("");
	const [division, setDivision] = useState<Division>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(
		null
	);

	const handleAthleteSelect = (athleteId: string) => {
		if (athleteId === "new") {
			// Reset form for new athlete
			setName("");
			setCrossfitId("");
			setTeamId("");
			setDivision(null);
			setSelectedAthleteId(null);
			return;
		}

		const selectedAthlete = unassignedAthletes.find(
			(athlete) => athlete.id === athleteId
		);
		if (selectedAthlete) {
			setName(selectedAthlete.name || "");
			setCrossfitId(selectedAthlete.crossfit_id || "");
			setDivision(selectedAthlete.athlete_division);

			// Set team if available
			if (
				selectedAthlete.athlete_teams &&
				selectedAthlete.athlete_teams.length > 0
			) {
				const teamId = selectedAthlete.athlete_teams[0]?.team?.id;
				if (teamId) {
					setTeamId(teamId);
				}
			}

			setSelectedAthleteId(athleteId);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		setLoading(true);
		setError(null);

		try {
			if (selectedAthleteId) {
				// Use server action if available
				if (claimAthleteProfile) {
					const formData = new FormData();
					formData.append("athleteId", selectedAthleteId);
					formData.append("userId", user.id);
					formData.append("name", name);
					formData.append("email", user.email || "");
					formData.append("crossfitId", crossfitId);
					formData.append("division", division || "");
					formData.append("teamId", teamId);

					const result = await claimAthleteProfile(formData);

					if (result.error) {
						throw new Error(result.error);
					}

					// Success! Redirect to dashboard
					router.push("/dashboard");
					return;
				}

				// Fall back to client-side update if server action not available
				// For unassigned athletes, we need to use a different approach due to RLS policies
				// Create a special endpoint call to claim an athlete profile
				const { data: claimResponse, error: claimError } =
					await supabase.functions.invoke("claim-athlete-profile", {
						body: {
							athleteId: selectedAthleteId,
							userId: user.id,
							name,
							email: user.email!,
							crossfitId,
							division,
							teamId,
						},
					});

				// If the edge function isn't available, fall back to direct update
				// This will likely fail due to RLS policies unless they're modified
				if (claimError) {
					console.warn(
						"Edge function not available, falling back to direct update",
						claimError
					);

					// Update existing athlete
					const { error: updateError } = await supabase
						.from("athletes")
						.update({
							user_id: user.id,
							name,
							email: user.email!,
							crossfit_id: crossfitId,
							athlete_division: division,
						})
						.eq("id", selectedAthleteId);

					if (updateError) {
						console.error("Direct update failed:", updateError);
						throw new Error(
							"Failed to claim athlete profile. Please contact support."
						);
					}

					// If team changed, update team association
					if (teamId) {
						// Check if athlete already has a team
						const { data: existingTeam } = await supabase
							.from("athlete_teams")
							.select("id, team_id")
							.eq("athlete_id", selectedAthleteId)
							.single();

						if (existingTeam) {
							if (existingTeam.team_id !== teamId) {
								// Update team if different
								const { error: teamUpdateError } = await supabase
									.from("athlete_teams")
									.update({
										team_id: teamId,
										is_active: true,
									})
									.eq("id", existingTeam.id);

								if (teamUpdateError) throw teamUpdateError;
							}
						} else {
							// Create new team association
							const { error: teamInsertError } = await supabase
								.from("athlete_teams")
								.insert({
									athlete_id: selectedAthleteId,
									team_id: teamId,
									is_active: true,
								});

							if (teamInsertError) throw teamInsertError;
						}
					}
				}
			} else {
				// Create new athlete profile
				const { error: athleteError } = await supabase.from("athletes").insert({
					user_id: user.id!,
					name,
					email: user.email!,
					crossfit_id: crossfitId,
					athlete_division: division,
				});

				if (athleteError) throw athleteError;

				// Get the created athlete
				const { data: athlete } = await supabase
					.from("athletes")
					.select("id")
					.eq("user_id", user.id)
					.single();

				if (!athlete) throw new Error("Failed to create athlete profile");

				// Create team association
				const { error: teamError } = await supabase
					.from("athlete_teams")
					.insert({
						athlete_id: athlete.id,
						team_id: teamId,
						is_active: true,
					});

				if (teamError) throw teamError;
			}

			router.push("/dashboard");
		} catch (error) {
			setError(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Create Your Athlete Profile</CardTitle>
					<CardDescription>
						Set up your profile to start tracking points
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
						{error && (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						{unassignedAthletes.length > 0 && (
							<div className="space-y-2">
								<Label htmlFor="existing-athlete">
									Select Your Athlete Profile
								</Label>
								<Select
									value={selectedAthleteId || "new"}
									onValueChange={handleAthleteSelect}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select your profile or create new" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="new">Create New Profile</SelectItem>

										{/* Group athletes by team */}
										{(() => {
											// Create a map of teams to athletes
											const teamMap = new Map<string, AthleteWithTeams[]>();
											const noTeamAthletes: AthleteWithTeams[] = [];

											// Sort athletes into teams
											unassignedAthletes.forEach((athlete) => {
												if (
													athlete.athlete_teams &&
													athlete.athlete_teams.length > 0 &&
													athlete.athlete_teams[0]?.team
												) {
													const teamName =
														athlete.athlete_teams[0].team.name ||
														"Unknown Team";
													if (!teamMap.has(teamName)) {
														teamMap.set(teamName, []);
													}
													teamMap.get(teamName)?.push(athlete);
												} else {
													noTeamAthletes.push(athlete);
												}
											});

											// Sort teams alphabetically
											const sortedTeams = Array.from(teamMap.keys()).sort();

											return (
												<>
													{sortedTeams.map((teamName) => (
														<div key={teamName} className="space-y-1">
															<div className="px-2 py-1.5 text-sm font-semibold bg-muted/50">
																{teamName}
															</div>
															{teamMap
																.get(teamName)
																?.sort((a, b) =>
																	(a.name || "").localeCompare(b.name || "")
																)
																.map((athlete) => (
																	<SelectItem
																		key={athlete.id}
																		value={athlete.id}
																		className="pl-8"
																	>
																		<span className="ml-2">
																			{athlete.name}{" "}
																			{athlete.athlete_division
																				? `(${athlete.athlete_division})`
																				: ""}
																		</span>
																	</SelectItem>
																))}
														</div>
													))}

													{noTeamAthletes.length > 0 && (
														<div className="space-y-1">
															<div className="px-2 py-1.5 text-sm font-semibold bg-muted/50">
																No Team Assigned
															</div>
															{noTeamAthletes
																.sort((a, b) =>
																	(a.name || "").localeCompare(b.name || "")
																)
																.map((athlete) => (
																	<SelectItem
																		key={athlete.id}
																		value={athlete.id}
																		className="pl-8"
																	>
																		<span className="ml-2">
																			{athlete.name}{" "}
																			{athlete.athlete_division
																				? `(${athlete.athlete_division})`
																				: ""}
																		</span>
																	</SelectItem>
																))}
														</div>
													)}
												</>
											);
										})()}
									</SelectContent>
								</Select>
								<p className="text-sm text-muted-foreground">
									⚠️ Because the competition has started, we have created
									athlete profiles for everyone who has yet to sign up.
								</p>
								<p className="text-sm text-muted-foreground">
									Select an existing profile. If you don&apos;t see your name,
									please create a new profile
								</p>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="name">Full Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<div className="flex flex-col gap-2">
								<Label htmlFor="crossfit_id">CrossFit ID</Label>
								<span className="text-sm text-muted-foreground">
									You can find your CrossFit ID on{" "}
									<a
										href="https://www.crossfit.com/dashboard"
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-500 hover:text-blue-600 underline"
									>
										your CrossFit profile
									</a>
								</span>
								<Image
									src="/images/crossfit-id.png"
									className="rounded-md"
									alt="CrossFit Logo"
									width={398}
									height={100}
								/>
								<Input
									id="crossfit_id"
									value={crossfitId}
									className="mt-2"
									onChange={(e) => setCrossfitId(e.target.value)}
									required
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="division">Division</Label>
							<Select
								value={division ?? undefined}
								onValueChange={(value: string) =>
									setDivision(value as Division)
								}
								required
							>
								<SelectTrigger>
									<SelectValue placeholder="Select your division" />
								</SelectTrigger>
								<SelectContent>
									{divisions.map((div) => (
										<SelectItem key={div.value} value={div?.value ?? ""}>
											{div.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="text-sm text-muted-foreground">
								Select the division you&apos;ll be competing in for the Open
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="team">Select Your Team</Label>
							<Select value={teamId} onValueChange={setTeamId} required>
								<SelectTrigger>
									<SelectValue placeholder="Select a team" />
								</SelectTrigger>
								<SelectContent>
									{teams.map((team) => (
										<SelectItem key={team.id} value={team.id}>
											<div className="flex flex-col gap-1">
												<span>{team.name}</span>
												<span className="text-xs text-muted-foreground">
													Captain: {team.captain?.name || "No captain assigned"}
												</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading
								? selectedAthleteId
									? "Updating Profile..."
									: "Creating Profile..."
								: selectedAthleteId
								? "Update Profile"
								: "Create Profile"}
						</Button>
					</CardContent>
				</form>
			</Card>
		</div>
	);
}
