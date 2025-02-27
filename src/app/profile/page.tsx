import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/supabase/queries/server/athletes";
import ProfileClient from "./_components/profile-client";

export default async function ProfilePage() {
	const supabase = await createServerClient();
	const { data } = await supabase.auth.getUser();

	if (!data.user) {
		redirect("/login");
	}

	try {
		const profile = await getUserProfile(data.user.id);
		return <ProfileClient profile={profile} />;
	} catch (error) {
		// If profile doesn't exist, redirect to onboarding
		redirect("/onboarding");
	}
}
