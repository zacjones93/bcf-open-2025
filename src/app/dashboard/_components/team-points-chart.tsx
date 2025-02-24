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

interface TeamPointsChartProps {
	data: Array<{
		name: string;
		total: number;
	}>;
}

const teamColors = {
	black: "#000000",
	blue: "#2563eb",
	red: "#dc2626",
};

function getTeamColor(teamName: string): string {
	// Remove parentheses and their contents, and convert to lowercase
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

export function TeamPointsChart({ data }: TeamPointsChartProps) {
	const dataWithTruncatedNames = data.map((team) => ({
		...team,
		truncatedName: truncateTeamName(team.name),
	}));

	return (
		<ResponsiveContainer width="100%" height="100%">
			<BarChart data={dataWithTruncatedNames} margin={{ bottom: 70 }}>
				<XAxis
					dataKey="truncatedName"
					angle={-45}
					textAnchor="end"
					height={80}
					interval={0}
				/>
				<YAxis />
				<Tooltip />
				<Bar dataKey="total">
					{dataWithTruncatedNames.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={getTeamColor(entry.name)} />
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
}
