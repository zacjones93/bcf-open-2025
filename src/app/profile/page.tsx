"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/components/providers/supabase-auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/types/database.types";

type Division = Database["public"]["Enums"]["athlete_division"];

interface AthleteProfile {
	id: string;
	user_id: string;
	name: string;
	email: string;
	crossfit_id: string;
	athlete_division: Division | null;
	type: Database["public"]["Enums"]["athlete type"] | null;
	team_id?: string;
	athlete_teams: Array<{
		team: {
			name: string;
		} | null;
	}>;
}

export default function ProfilePage() {
	const [profile, setProfile] = useState<AthleteProfile | null>(null);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [crossfitId, setCrossfitId] = useState("");
	const [division, setDivision] = useState<Division | null>(null);
	const [teamName, setTeamName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const router = useRouter();
	const { user } = useSupabaseAuth();
	const supabase = createClient();

	useEffect(() => {
		if (!user?.id) {
			router.push("/login");
			return;
		}

		async function loadProfile() {
			try {
				const { data: profile, error } = await supabase
					.from("athletes")
					.select(
						`
						*,
						athlete_teams!inner(
							team:teams(name)
						)
					`
					)
					.eq("user_id", user?.id ?? "")
					.single();

				if (error) throw error;

				if (profile) {
					setProfile(profile);
					setName(profile.name);
					setEmail(profile.email);
					setCrossfitId(profile.crossfit_id);
					setDivision(profile.athlete_division);
					setTeamName(profile.athlete_teams[0]?.team?.name || "");
				}
			} catch (error) {
				console.error("Error loading profile:", error);
				setError("Failed to load profile");
			} finally {
				setLoading(false);
			}
		}

		loadProfile();
	}, [user, router, supabase]);

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setError(null);
		setSuccess(false);

		try {
			const { error } = await supabase
				.from("athletes")
				.update({
					name,
					email,
					crossfit_id: crossfitId,
					athlete_division: division,
				})
				.eq("user_id", user?.id ?? "");

			if (error) throw error;

			setSuccess(true);
		} catch (error) {
			console.error("Error updating profile:", error);
			setError("Failed to update profile");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-background p-8">
				<div className="mx-auto max-w-2xl space-y-8">
					<Card>
						<CardHeader>
							<Skeleton className="h-8 w-[200px]" />
							<Skeleton className="h-4 w-[300px]" />
						</CardHeader>
						<CardContent className="space-y-4">
							{Array.from({ length: 4 }).map((_, i) => (
								<div key={i} className="space-y-2">
									<Skeleton className="h-4 w-[100px]" />
									<Skeleton className="h-10 w-full" />
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background p-8">
			<div className="mx-auto max-w-2xl space-y-8">
				<Card>
					<CardHeader>
						<CardTitle>Profile Settings</CardTitle>
						<CardDescription>
							Update your athlete profile information
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleUpdateProfile}>
						<CardContent className="space-y-4">
							{error && (
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}
							{success && (
								<Alert>
									<AlertDescription>
										Profile updated successfully!
									</AlertDescription>
								</Alert>
							)}
							<div className="space-y-2">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="crossfitId">CrossFit ID</Label>
								<Input
									id="crossfitId"
									value={crossfitId}
									onChange={(e) => setCrossfitId(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="division">Division</Label>
								<Select
									value={division ?? undefined}
									onValueChange={(value: Division) => setDivision(value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select division" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="open (m)">Open (Men)</SelectItem>
										<SelectItem value="open (f)">Open (Women)</SelectItem>
										<SelectItem value="scaled (m)">Scaled (Men)</SelectItem>
										<SelectItem value="scaled (f)">Scaled (Women)</SelectItem>
										<SelectItem value="masters (55+ m)">
											Masters 55+ (Men)
										</SelectItem>
										<SelectItem value="masters (55+ f)">
											Masters 55+ (Women)
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="team">Team</Label>
								<Input
									id="team"
									value={teamName}
									disabled
									className="bg-muted"
								/>
								<p className="text-sm text-muted-foreground">
									Team assignments can only be changed by administrators
								</p>
							</div>
						</CardContent>
						<CardFooter>
							<Button type="submit" disabled={saving}>
								{saving ? "Saving..." : "Save Changes"}
							</Button>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	);
}
