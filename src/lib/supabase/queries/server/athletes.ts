import { User } from "@supabase/supabase-js";
import { createServerClient } from "../../server";
import { Tables } from "@/types/database.types";

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

export const getCurrentAthleteTeammates = async () => {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    throw new Error("User not found");
  }

  const currentAthlete = await getCurrentAthleteWithTeam();

  const teamId = currentAthlete.athlete_teams[0]?.team?.id;

  if (!teamId) {
    throw new Error("Team not found");
  }

  const { data: teammates } = await supabase
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


  return teammates;
}


export const getCurrentAthleteWithTeam = async () => {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
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
    .eq("user_id", data.user.id)
    .single()
    .throwOnError();

  return currentAthlete;
}
