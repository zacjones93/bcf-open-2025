import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import {
	getTeamsWithCaptains,
	getUnassignedAthletes,
} from "@/lib/supabase/queries/server/athletes";
import OnboardingClient from "./_components/onboarding-client";
import { Database } from "@/types/database.types";

type Division =
	| Database["public"]["Enums"]["athlete_division"]
	| null
	| undefined;

export default async function OnboardingPage() {
	const supabase = await createServerClient();
	const { data } = await supabase.auth.getUser();

	if (!data.user) {
		redirect("/login");
	}

	// Check if user already has a profile
	const { data: athlete } = await supabase
		.from("athletes")
		.select("id")
		.eq("user_id", data.user.id)
		.single();

	if (athlete) {
		redirect("/dashboard");
	}

	// Fetch teams for the onboarding form
	const teams = await getTeamsWithCaptains();

	// Fetch unassigned athletes (athletes without a user_id)
	const unassignedAthletes = await getUnassignedAthletes();

	// Create a server action to claim an athlete profile
	async function claimAthleteProfile(formData: FormData) {
		"use server";

		const athleteId = formData.get("athleteId") as string;
		const userId = formData.get("userId") as string;
		const name = formData.get("name") as string;
		const email = formData.get("email") as string;
		const crossfitId = formData.get("crossfitId") as string;
		const division = formData.get("division") as Division;
		const teamId = formData.get("teamId") as string;

		if (!athleteId || !userId) {
			return { error: "Missing required fields" };
		}

		const supabase = await createServerClient();

		// Update the athlete profile with admin privileges (bypassing RLS)
		const { error: updateError } = await supabase
			.from("athletes")
			.update({
				user_id: userId,
				name,
				email,
				crossfit_id: crossfitId,
				athlete_division: division,
			})
			.eq("id", athleteId);

		if (updateError) {
			console.error("Failed to update athlete:", updateError);
			return { error: updateError.message };
		}

		// Handle team association if needed
		if (teamId) {
			// Check if athlete already has a team
			const { data: existingTeam } = await supabase
				.from("athlete_teams")
				.select("id, team_id")
				.eq("athlete_id", athleteId)
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

					if (teamUpdateError) {
						console.error("Failed to update team:", teamUpdateError);
						return { error: teamUpdateError.message };
					}
				}
			} else {
				// Create new team association
				const { error: teamInsertError } = await supabase
					.from("athlete_teams")
					.insert({
						athlete_id: athleteId,
						team_id: teamId,
						is_active: true,
					});

				if (teamInsertError) {
					console.error("Failed to create team association:", teamInsertError);
					return { error: teamInsertError.message };
				}
			}
		}

		return { success: true };
	}

	return (
		<OnboardingClient
			user={data.user}
			teams={teams}
			unassignedAthletes={unassignedAthletes || []}
			claimAthleteProfile={claimAthleteProfile}
		/>
	);
}
