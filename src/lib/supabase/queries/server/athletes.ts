'use server'

import { createClient } from "../../server";
import { Tables } from "@/types/database.types";

export type Athlete = Tables<"athletes">;
export type Team = Tables<"teams">;

export type AthleteWithTeams = Athlete & {
  athlete_teams: {
    team: Team | null;
  }[];
};

export type TeamWithAthletes = {
  id: string;
  name: string;
  athlete_teams: Array<{
    athlete: Array<{
      name: string;
      type: string;
    }>;
  }>;
};

export type TeamWithCaptain = {
  id: string;
  name: string;
  captain: {
    name: string;
    type: string;
  } | null;
};

export const getAthletesWithTeams = async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("athletes")
    .select(
      `
        *,
        athlete_teams!inner (
          team:teams!inner(*)
        )
      `
    )
    .order("name")
    .throwOnError();

  return data;
}

export const getUnassignedAthletes = async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("athletes")
    .select(
      `
        *,
        athlete_teams (
          team:teams(*)
        )
      `
    )
    .is("user_id", null)
    .order("name")
    .throwOnError();

  return data;
}

export const getCurrentAthleteTeammates = async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not found");
  }

  const currentAthlete = await getCurrentAthleteWithTeam();

  if (!currentAthlete?.athlete_teams?.[0]?.team?.id) {
    return [];
  }

  const teamId = currentAthlete.athlete_teams[0].team.id;

  const { data } = await supabase
    .from("athletes")
    .select(
      `
        *,
        athlete_teams!inner (
          team:teams!inner(*)
        )
      `
    )
    .eq("athlete_teams.team_id", teamId)
    .order("name")
    .throwOnError();

  return data || [];
}

export const getCurrentAthleteWithTeam = async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser()


  if (!user) {
    throw new Error("User not found");
  }

  const { data: currentAthlete } = await supabase
    .from("athletes")
    .select(
      `
      *,
      athlete_teams!inner (
        team:teams(*)
      )
    `
    )
    .eq("user_id", user.id)
    .single()
    .throwOnError();

  return currentAthlete;
}

export const isUserAdmin = async (userId?: string) => {
  const supabase = await createClient();


  if (!userId) {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not found");
    }
    userId = user.id;
  }

  if (!userId) {
    return false;
  }

  const { data: athlete } = await supabase
    .from('athletes')
    .select('type')
    .eq('user_id', userId)
    .single();

  return athlete?.type === 'admin';
}

export const getUserProfile = async (userId?: string) => {
  const supabase = await createClient();

  if (!userId) {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not found");
    }
    userId = user.id;
  }

  if (!userId) {
    throw new Error("User not found");
  }

  const { data: profile } = await supabase
    .from("athletes")
    .select(
      `
      *,
      athlete_teams!inner(
        team:teams(name)
      )
    `
    )
    .eq("user_id", userId)
    .single()
    .throwOnError();

  return profile;
}

export const getTeamsWithCaptains = async (): Promise<TeamWithCaptain[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teams")
    .select(
      `
      id, 
      name,
      athlete_teams!inner (
        athlete:athletes!inner (
          name,
          type
        )
      )
    `
    )
    .eq("athlete_teams.is_active", true)
    .order("name");

  if (error) {
    throw error;
  }

  // Transform the data to include captain information
  const teamsWithCaptains = (data as TeamWithAthletes[]).map((team) => ({
    id: team.id,
    name: team.name,
    captain:
      team.athlete_teams.find((at) => at.athlete[0]?.type === "captain")?.athlete[0] || null,
  }));

  return teamsWithCaptains;
}
