import { Suspense } from "react";
import { DivisionGroups } from "@/app/dashboard/_components/division-groups";

interface DivisionsPageProps {
	searchParams: Promise<{
		workout?: string;
	}>;
}

export default async function DivisionsPage({
	searchParams,
}: DivisionsPageProps) {
	const resolvedSearchParams = await searchParams;
	const selectedWorkoutId = resolvedSearchParams.workout;

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
				<div className="space-y-4">
					<h2 className="text-2xl font-bold tracking-tight">
						Athletes by Division
					</h2>
					<Suspense
						fallback={
							<div className="text-center py-4 text-muted-foreground">
								Loading divisions...
							</div>
						}
					>
						<DivisionGroups selectedWorkoutId={selectedWorkoutId} />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
