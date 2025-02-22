import { Suspense } from "react";
import { PointAssignmentsTable } from "./_components/point-assignments-table";

export default function PointAssignmentsPage() {
	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
				<div className="space-y-4">
					<h2 className="text-2xl font-bold tracking-tight">
						Point Assignments
					</h2>
					<Suspense fallback={<div>Loading...</div>}>
						<PointAssignmentsTable />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
