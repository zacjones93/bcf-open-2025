import { getPointAssignments } from "@/lib/supabase/queries/server/points";
import { PointAssignmentsTable } from "./_components/point-assignments-table";

export default async function PointAssignmentsPage() {
	const assignments = await getPointAssignments();

	return (
		<div className="min-h-screen bg-background p-8">
			<div className="mx-auto max-w-7xl space-y-8">
				<h2 className="text-2xl font-bold tracking-tight">Point Assignments</h2>
				<PointAssignmentsTable initialData={assignments || []} />
			</div>
		</div>
	);
}
