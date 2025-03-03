"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";
import { PointAssignmentsMobile } from "./point-assignments-mobile";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import type { PointAssignmentWithRelations } from "@/lib/supabase/queries/server/points";

type Filters = {
	athlete: string;
	assigner: string;
	type: string;
	workout: string;
	team: string;
};

interface PointAssignmentsTableProps {
	initialData: PointAssignmentWithRelations[];
	isAdmin: boolean;
}

export function PointAssignmentsTable({
	initialData,
	isAdmin,
}: PointAssignmentsTableProps) {
	const [assignments, setAssignments] =
		useState<PointAssignmentWithRelations[]>(initialData);
	const searchParams = useSearchParams();
	const router = useRouter();
	const supabase = createClient();

	// Initialize filters from URL params
	const [filters, setFilters] = useState<Filters>({
		athlete: searchParams.get("athlete") || "all",
		assigner: searchParams.get("assigner") || "all",
		type: searchParams.get("type") || "all",
		workout: searchParams.get("workout") || "all",
		team: searchParams.get("team") || "all",
	});

	// Update URL when filters change
	const updateUrlParams = (newFilters: Filters) => {
		const params = new URLSearchParams();
		Object.entries(newFilters).forEach(([key, value]) => {
			if (value !== "all") {
				params.set(key, value);
			}
		});
		const queryString = params.toString();
		const newUrl = queryString ? `?${queryString}` : "";
		router.push(newUrl);
	};

	// Update filters and URL
	const handleFilterChange = (key: keyof Filters, value: string) => {
		const newFilters = { ...filters, [key]: value };
		setFilters(newFilters);
		updateUrlParams(newFilters);
	};

	async function handleDelete(id: string) {
		try {
			// Delete the point assignment
			const { error: assignmentError } = await supabase
				.from("point_assignments")
				.delete()
				.eq("id", id);

			if (assignmentError) throw assignmentError;

			// Update local state
			setAssignments(assignments.filter((a) => a.id !== id));
		} catch (error) {
			console.error("Error in handleDelete:", error);
		}
	}

	if (!assignments.length) {
		return (
			<div className="text-center py-4 text-muted-foreground">
				No point assignments found
			</div>
		);
	}

	// Extract unique values for filters
	const athletes = [
		...new Set(assignments.map((a) => a.assignee?.name).filter(Boolean)),
	].sort();
	const assigners = [
		...new Set(assignments.map((a) => a.assigner?.name).filter(Boolean)),
	].sort();
	const types = [
		...new Set(assignments.map((a) => a.point_type?.name).filter(Boolean)),
	].sort();
	const workouts = [
		...new Set(assignments.map((a) => a.workout?.name).filter(Boolean)),
	].sort();
	const teams = [
		...new Set(assignments.map((a) => a.team?.name).filter(Boolean)),
	].sort();

	// Filter assignments based on selected filters
	const filteredAssignments = assignments.filter((assignment) => {
		const matchesAthlete =
			filters.athlete === "all" ||
			assignment.assignee?.name === filters.athlete;
		const matchesAssigner =
			filters.assigner === "all" ||
			assignment.assigner?.name === filters.assigner;
		const matchesType =
			filters.type === "all" || assignment.point_type?.name === filters.type;
		const matchesWorkout =
			filters.workout === "all" || assignment.workout?.name === filters.workout;
		const matchesTeam =
			filters.team === "all" || assignment.team?.name === filters.team;

		return (
			matchesAthlete &&
			matchesAssigner &&
			matchesType &&
			matchesWorkout &&
			matchesTeam
		);
	});

	return (
		<>
			{/* Mobile View */}
			<div className="md:hidden">
				<PointAssignmentsMobile
					assignments={filteredAssignments}
					onDelete={handleDelete}
					isAdmin={isAdmin}
				/>
			</div>

			{/* Desktop View */}
			<div className="hidden md:block space-y-4">
				{/* Filters */}
				<div className="grid grid-cols-5 gap-4">
					<div>
						<Select
							value={filters.athlete}
							onValueChange={(value) => handleFilterChange("athlete", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Filter by Athlete" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Athletes</SelectItem>
								{athletes.map((name) => (
									<SelectItem key={name} value={name || ""}>
										{name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Select
							value={filters.assigner}
							onValueChange={(value) => handleFilterChange("assigner", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Filter by Assigner" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Assigners</SelectItem>
								{assigners.map((name) => (
									<SelectItem key={name} value={name || ""}>
										{name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Select
							value={filters.type}
							onValueChange={(value) => handleFilterChange("type", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Filter by Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								{types.map((type) => (
									<SelectItem key={type} value={type || ""}>
										{type}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Select
							value={filters.workout}
							onValueChange={(value) => handleFilterChange("workout", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Filter by Workout" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Workouts</SelectItem>
								{workouts.map((workout) => (
									<SelectItem key={workout} value={workout || ""}>
										{workout}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Select
							value={filters.team}
							onValueChange={(value) => handleFilterChange("team", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Filter by Team" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Teams</SelectItem>
								{teams.map((team) => (
									<SelectItem key={team} value={team || ""}>
										{team}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Table */}
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Athlete</TableHead>
								<TableHead>Assigned By</TableHead>
								<TableHead>Team</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Workout</TableHead>
								<TableHead className="text-right">Points</TableHead>
								<TableHead>Notes</TableHead>
								{isAdmin && <TableHead className="w-[50px]">Actions</TableHead>}
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredAssignments.map((assignment) => (
								<TableRow key={assignment.id}>
									<TableCell>
										{assignment.created_at
											? new Date(assignment.created_at).toLocaleDateString()
											: "-"}
									</TableCell>
									<TableCell>
										{assignment.assignee?.name || "Unknown"}
									</TableCell>
									<TableCell>
										{assignment.assigner?.name || "Unknown"}
									</TableCell>
									<TableCell>{assignment.team?.name || "-"}</TableCell>
									<TableCell>
										{assignment.point_type?.name || "Unknown Type"}
									</TableCell>
									<TableCell>{assignment.workout?.name || "-"}</TableCell>
									<TableCell className="text-right">
										{assignment.point_type?.points || 0}
									</TableCell>
									<TableCell className="max-w-[200px] truncate">
										{assignment.notes || "-"}
									</TableCell>
									{isAdmin && (
										<TableCell>
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0"
												onClick={() => handleDelete(assignment.id)}
											>
												<X className="h-4 w-4" />
												<span className="sr-only">Delete</span>
											</Button>
										</TableCell>
									)}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		</>
	);
}
