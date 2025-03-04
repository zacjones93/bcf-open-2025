'use server'

import { createClient } from "../../server";
import { Tables } from "@/types/database.types";
import { SPIRIT_OF_THE_OPEN_POINT_TYPE_ID } from "@/lib/constants";

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

export interface SpiritWinner {
  workout: {
    name: string;
    week_number: number;
  };
  athlete: {
    name: string;
  };
  notes: string | null;
}

interface SpiritWinnerResponse {
  workout: {
    name: string;
    week_number: number;
  };
  assignee: {
    name: string;
  };
  notes: string | null;
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

export const getSpiritWinners = async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("point_assignments")
    .select(`
      workout:workouts (
        name,
        week_number
      ),
      assignee:athletes!point_assignments_assignee_id_fkey (
        name
      ),
      notes
    `)
    .eq("point_type_id", SPIRIT_OF_THE_OPEN_POINT_TYPE_ID)
    .order("workout_id", { ascending: true })
    .throwOnError();

  return (data as unknown as Array<{
    workout: { name: string; week_number: number };
    assignee: { name: string };
    notes: string | null;
  }>)?.map(item => ({
    workout: {
      name: item.workout.name,
      week_number: item.workout.week_number
    },
    athlete: {
      name: item.assignee.name
    },
    notes: item.notes
  })) as SpiritWinner[];
};


