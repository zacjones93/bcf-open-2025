import { createServerClient } from "../../server";
import { Tables } from "@/types/database.types";

export type Athlete = Tables<"athletes">;

export type AthleteWithTeams = Athlete & {
  athlete_teams: {
    team: {
      id: string;
      name: string;
    } | null;
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
          team:teams(
            id,
            name
          )
        )
      `
    )
    .order("name")
    .throwOnError();

  return data;
}