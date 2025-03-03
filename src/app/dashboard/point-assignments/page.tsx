import { getPointAssignments } from "@/lib/supabase/queries/server/points";
import { isUserAdmin } from "@/lib/supabase/queries/server/athletes";
import { PointAssignmentsTable } from "./_components/point-assignments-table";
import { getCachedUser } from "@/lib/supabase/cached-auth";

export default async function PointAssignmentsPage() {
	const user = await getCachedUser();

	if (!user) {
		throw new Error("User not found");
	}

	const assignments = await getPointAssignments();
	const isAdmin = user ? await isUserAdmin(user.id) : false;

	return (
		<div className="min-h-screen bg-background p-8">
			<div className="mx-auto max-w-7xl space-y-8">
				<h2 className="text-2xl font-bold tracking-tight">Point Assignments</h2>
				<PointAssignmentsTable
					initialData={assignments || []}
					isAdmin={isAdmin}
				/>
			</div>
		</div>
	);
}
