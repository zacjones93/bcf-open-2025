import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { PointAssignmentWithRelations } from "@/lib/supabase/queries/server/points";

interface PointAssignmentsMobileProps {
	assignments: PointAssignmentWithRelations[];
	onDelete: (id: string) => void;
	isAdmin: boolean;
}

export function PointAssignmentsMobile({
	assignments,
	onDelete,
	isAdmin,
}: PointAssignmentsMobileProps) {
	return (
		<div className="space-y-4">
			{assignments.map((assignment) => (
				<div
					key={assignment.id}
					className="rounded-lg border bg-card text-card-foreground shadow-sm"
				>
					<div className="p-4 space-y-2">
						<div className="flex items-center justify-between">
							<div className="font-medium">{assignment.assignee?.name}</div>
							{isAdmin && (
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0"
									onClick={() => onDelete(assignment.id)}
								>
									<X className="h-4 w-4" />
									<span className="sr-only">Delete</span>
								</Button>
							)}
						</div>
						<div className="text-sm text-muted-foreground">
							<div>Assigned by: {assignment.assigner?.name}</div>
							<div>Team: {assignment.team?.name || "-"}</div>
							<div>Type: {assignment.point_type?.name}</div>
							<div>Workout: {assignment.workout?.name || "-"}</div>
							<div>Points: {assignment.point_type?.points || 0}</div>
							<div>Notes: {assignment.notes || "-"}</div>
							<div>
								Date:{" "}
								{assignment.created_at
									? new Date(assignment.created_at).toLocaleDateString()
									: "-"}
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
