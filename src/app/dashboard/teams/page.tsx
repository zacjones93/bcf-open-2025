import { Suspense } from "react";
import { TeamsList } from "./_components/teams-list";

export default function TeamsPage() {
	return (
		<div className="min-h-screen bg-background p-8">
			<div className="mx-auto max-w-7xl space-y-8">
				<div className="space-y-4">
					<h2 className="text-2xl font-bold tracking-tight">Teams</h2>
					<Suspense fallback={<div>Loading...</div>}>
						<TeamsList />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
