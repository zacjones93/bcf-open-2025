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
}: OnboardingClientProps) {
	const router = useRouter();
	const supabase = createClient();

	const [name, setName] = useState("");
	const [crossfitId, setCrossfitId] = useState("");
	const [teamId, setTeamId] = useState("");
	const [division, setDivision] = useState<Division>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		setLoading(true);
		setError(null);

		try {
			// Create athlete profile
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
			const { error: teamError } = await supabase.from("athlete_teams").insert({
				athlete_id: athlete.id,
				team_id: teamId,
				is_active: true,
			});

			if (teamError) throw teamError;

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
							{loading ? "Creating Profile..." : "Create Profile"}
						</Button>
					</CardContent>
				</form>
			</Card>
		</div>
	);
}
