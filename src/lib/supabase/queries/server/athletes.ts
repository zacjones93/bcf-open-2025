import { User } from "@supabase/supabase-js";
import { createServerClient } from "../../server";
import { Tables } from "@/types/database.types";
import { getCachedUser } from "../../cached-auth";

export type Athlete = Tables<"athletes">;
export type Team = Tables<"teams">;

export type AthleteWithTeams = Athlete & {
  athlete_teams: {
    team: Team | null;
  }[];
};

export const getAthletesWithTeams = async () => {
  const supabase = await createServerClient();
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
  const supabase = await createServerClient();
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
  const user = await getCachedUser();

  if (!user) {
    throw new Error("User not found");
  }

  const currentAthlete = await getCurrentAthleteWithTeam();

  if (!currentAthlete?.athlete_teams?.[0]?.team?.id) {
    return [];
  }

  const teamId = currentAthlete.athlete_teams[0].team.id;

  const supabase = await createServerClient();
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
  const supabase = await createServerClient();
  const user = await getCachedUser();

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
  const supabase = await createServerClient();


  if (!userId) {
    const user = await getCachedUser();

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
  const supabase = await createServerClient();

  if (!userId) {
    const user = await getCachedUser();

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

export const getTeamsWithCaptains = async () => {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("teams")
    .select(
      `
      id, 
      name,
      athlete_teams!inner (
        athlete:athlete_id (
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
  const teamsWithCaptains = data.map((team) => ({
    id: team.id,
    name: team.name,
    captain:
      team.athlete_teams.find((at) => at.athlete?.type === "captain")
        ?.athlete || null,
  }));

  return teamsWithCaptains;
}
