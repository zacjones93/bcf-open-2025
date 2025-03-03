'use server'

import { createClient } from "../../server";
import { Tables } from "@/types/database.types";

export type PointType = Tables<"point_types">;
export type PointAssignment = Tables<"point_assignments">;

export interface PointAssignmentWithRelations extends PointAssignment {
  assigner: { name: string } | null;
  assignee: {
    name: string;
    athlete_teams: Array<{
      team: { name: string } | null;
    }>;
  } | null;
  point_type: { name: string; points: number } | null;
  workout: { name: string } | null;
  team?: { name: string } | null;
}

export const getAllPointTypes = async (filters?: { category?: string }) => {
  const supabase = await createClient();
  const query = supabase
    .from("point_types")
    .select("*")
    .order("category, name");

  if (filters?.category) {
    query.eq("category", filters.category);
  }

  const { data } = await query.throwOnError();
  return data;
};

export const getPointAssignments = async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("point_assignments")
    .select(
      `
      *,
      assigner:athletes!point_assignments_assigner_id_fkey(name),
      assignee:athletes!point_assignments_assignee_id_fkey(
        name,
        athlete_teams!inner (
          team:teams(name)
        )
      ),
      point_type:point_types(name, points),
      workout:workouts(name)
    `
    )
    .order("created_at", { ascending: false })
    .throwOnError();

  return data?.map(assignment => ({
    ...assignment,
    team: assignment.assignee?.athlete_teams?.[0]?.team || null,
  })) as PointAssignmentWithRelations[];
};


