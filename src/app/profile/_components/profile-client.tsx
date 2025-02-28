"use client";

import { useState } from "react";
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
	user_id: string | null;
	name: string;
	email: string | null;
	crossfit_id: string | null;
	athlete_division: Division | null;
	type: Database["public"]["Enums"]["athlete type"] | null;
	team_id?: string;
	athlete_teams: Array<{
		team: {
			name: string;
		} | null;
	}>;
}

interface ProfileClientProps {
	profile: AthleteProfile;
}

export default function ProfileClient({ profile }: ProfileClientProps) {
	const [name, setName] = useState(profile.name);
	const [email, setEmail] = useState(profile.email || "");
	const [crossfitId, setCrossfitId] = useState(profile.crossfit_id || "");
	const [division, setDivision] = useState<Division | null>(
		profile.athlete_division
	);
	const [teamName, setTeamName] = useState(
		profile.athlete_teams[0]?.team?.name || ""
	);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [saving, setSaving] = useState(false);
	const { user } = useSupabaseAuth();
	const supabase = createClient();

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
				.eq("id", profile.id);

			if (error) throw error;

			setSuccess(true);
		} catch (error) {
			console.error("Error updating profile:", error);
			setError("Failed to update profile");
		} finally {
			setSaving(false);
		}
	};

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
