"use client";

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkoutCompletionChartsProps {
	data: {
		workoutId: string;
		workoutName: string;
		teams: Array<{
			name: string;
			totalAthletes: number;
			completedAthletes: number;
			points: number;
		}>;
	}[];
}

const teamColors = {
	black: "#000000",
	blue: "#2563eb",
	red: "#dc2626",
};

function getTeamColor(teamName: string): string {
	const normalizedName = teamName
		.replace(/\s*\([^)]*\)/g, "")
		.toLowerCase()
		.trim();

	if (normalizedName.includes("grim reaper")) return teamColors.black;
	if (normalizedName.includes("blue-tang clan")) return teamColors.blue;
	if (normalizedName.includes("apsey-lute domination")) return teamColors.red;
	return "#000";
}

function truncateTeamName(name: string): string {
	return name.length > 10 ? name.slice(0, 10) + "..." : name;
}

function WorkoutChart({
	workoutName,
	teams,
}: {
	workoutName: string;
	teams: WorkoutCompletionChartsProps["data"][0]["teams"];
}) {
	const teamsWithTruncatedNames = teams.map((team) => ({
		...team,
		truncatedName: truncateTeamName(team.name),
	}));

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">{workoutName}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-[300px]">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={teamsWithTruncatedNames} margin={{ bottom: 70 }}>
							<XAxis
								dataKey="truncatedName"
								angle={-45}
								textAnchor="end"
								height={80}
								interval={0}
							/>
							<YAxis />
							<Tooltip
								content={({ active, payload }) => {
									if (active && payload && payload.length) {
										const data = payload[0].payload;
										return (
											<div className="rounded-lg border bg-background p-2 shadow-sm">
												<div className="grid grid-cols-2 gap-2">
													<div className="flex flex-col">
														<span className="text-[0.70rem] uppercase text-muted-foreground">
															Points
														</span>
														<span className="font-bold text-muted-foreground">
															{data.points}
														</span>
													</div>
													<div className="flex flex-col">
														<span className="text-[0.70rem] uppercase text-muted-foreground">
															Completion
														</span>
														<span className="font-bold text-muted-foreground">
															{data.completedAthletes}/{data.totalAthletes}
														</span>
													</div>
												</div>
											</div>
										);
									}
									return null;
								}}
							/>
							<Bar dataKey="points">
								{teamsWithTruncatedNames.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={getTeamColor(entry.name)} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>
				<div className="mt-4 space-y-2">
					{teams.map((team) => (
						<div key={team.name} className="flex justify-between text-sm">
							<span>{team.name}</span>
							<span className="text-muted-foreground">
								{team.completedAthletes}/{team.totalAthletes} completed
							</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export function WorkoutCompletionCharts({
	data,
}: WorkoutCompletionChartsProps) {
	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{data.map((workout) => (
				<WorkoutChart
					key={workout.workoutId}
					workoutName={workout.workoutName}
					teams={workout.teams}
				/>
			))}
		</div>
	);
}
