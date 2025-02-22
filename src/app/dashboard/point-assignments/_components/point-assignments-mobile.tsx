import { Card, CardContent } from "@/components/ui/card";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type PointAssignment = {
	id: string;
	created_at: string;
	assigner: { name: string | null } | null;
	assignee: { name: string | null } | null;
	point_type: { name: string | null; points: number | null } | null;
	workout: { name: string | null } | null;
	notes: string | null;
};

interface PointAssignmentsMobileProps {
	assignments: PointAssignment[];
	onDelete?: (id: string) => void;
}

export function PointAssignmentsMobile({
	assignments,
	onDelete,
}: PointAssignmentsMobileProps) {
	const { isAdmin } = useIsAdmin();

	if (!assignments?.length) {
		return (
			<div className="text-center py-4 text-muted-foreground">
				No point assignments found
			</div>
		);
	}

	return (
		<div className="space-y-4 px-4">
			{assignments.map((assignment) => (
				<Card key={assignment.id} className="w-full">
					<CardContent className="p-6 space-y-4">
						<div className="flex justify-between items-start">
							<div className="space-y-1">
								<p className="text-lg font-medium">
									{assignment.assignee?.name || "Unknown"}
								</p>
								<p className="text-sm text-muted-foreground">
									Assigned by {assignment.assigner?.name || "Unknown"}
								</p>
							</div>
							<div className="text-right flex items-start gap-2">
								<div>
									<p className="text-lg font-medium">
										{assignment.point_type?.points || 0} points
									</p>
									<p className="text-sm text-muted-foreground">
										{new Date(assignment.created_at).toLocaleDateString()}
									</p>
								</div>
								{isAdmin && onDelete && (
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
						</div>

						<div className="space-y-1">
							<p className="text-base font-medium">
								{assignment.point_type?.name || "Unknown Type"}
							</p>
							{assignment.workout?.name && (
								<p className="text-sm text-muted-foreground">
									{assignment.workout.name}
								</p>
							)}
						</div>

						{assignment.notes && (
							<p className="text-sm text-muted-foreground border-t pt-3">
								{assignment.notes}
							</p>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
