import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/supabase/queries/server/athletes";
import ProfileClient from "./_components/profile-client";
import { getCachedUser } from "@/lib/supabase/cached-auth";

export default async function ProfilePage() {
	const user = await getCachedUser();

	if (!user) {
		throw new Error("User not found");
	}

	if (!user) {
		redirect("/login");
	}

	try {
		const profile = await getUserProfile(user.id);
		return <ProfileClient profile={profile} />;
	} catch (error) {
		// If profile doesn't exist, redirect to onboarding
		redirect("/onboarding");
	}
}
