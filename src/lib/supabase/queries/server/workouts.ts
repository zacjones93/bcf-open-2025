import { createServerClient } from "../../server";
import { Tables } from "@/types/database.types";

export type Workout = Tables<"workouts">;

export const getAllWorkouts = async () => {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("workouts")
    .select("*")
    .order("week_number")
    .throwOnError();
  return data;
};
