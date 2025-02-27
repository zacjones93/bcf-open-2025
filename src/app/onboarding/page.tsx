import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getTeamsWithCaptains } from "@/lib/supabase/queries/server/athletes";
import OnboardingClient from "./_components/onboarding-client";

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

	return <OnboardingClient user={data.user} teams={teams} />;
}
