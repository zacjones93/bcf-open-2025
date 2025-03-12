"use client";

import { use } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type SpiritWinner,
} from "@/lib/supabase/queries/server/points";
import { Trophy } from "lucide-react";

interface SpiritWinnersProps {
	winnersLoader: Promise<SpiritWinner[]>;
}

export function SpiritWinners({ winnersLoader }: SpiritWinnersProps) {
	const winners = use(winnersLoader);

	if (!winners?.length) {
		return null;
	}

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold tracking-tight">
				Spirit of the Open Winners
			</h2>
			<div className="grid gap-4 md:grid-cols-3">
				{winners.sort((a, b) => a.workout.week_number - b.workout.week_number).map((winner) => (
					<Card key={`${winner.workout.week_number}-${winner.athlete.name}`}>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Trophy className="h-5 w-5 text-yellow-500" />
								Week {winner.workout.week_number}
							</CardTitle>
							<CardDescription>{winner.workout.name}</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="font-semibold">{winner.athlete.name}</p>
							{winner.notes && (
								<p className="mt-2 text-sm text-muted-foreground">
									{winner.notes}
								</p>
							)}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
