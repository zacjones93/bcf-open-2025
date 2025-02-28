import { createServerClient } from "../../server";
import { Tables } from "@/types/database.types";

export type Workout = Tables<"workouts">;
export type AthleteScore = Tables<"athlete_score">;

export const getAllWorkouts = async () => {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("workouts")
    .select("*")
    .order("week_number")
    .throwOnError();
  return data;
};

export const getActiveWorkoutWithScore = async (userId: string) => {
  const supabase = await createServerClient();

  // Get current athlete ID
  const { data: athlete } = await supabase
    .from("athletes")
    .select("id")
    .eq("user_id", userId)
    .single()
    .throwOnError();

  if (!athlete) {
    throw new Error("Athlete profile not found");
  }

  // Get active workout
  const now = new Date();
  const { data: workouts } = await supabase
    .from("workouts")
    .select("*")
    .lte("workout_date", now.toISOString())
    .order("workout_date", { ascending: false })
    .limit(1)
    .throwOnError();

  const workout = workouts?.[0];

  if (!workout) {
    return { workout: null, score: null };
  }

  // Check if workout is still active (within 3 days)
  const workoutDate = new Date(workout.workout_date);
  const cutoffDate = new Date(workoutDate);
  cutoffDate.setDate(cutoffDate.getDate() + 3);

  if (now > cutoffDate) {
    return { workout: null, score: null };
  }

  // Get existing score
  const { data: score } = await supabase
    .from("athlete_score")
    .select("*")
    .eq("workout_id", workout.id)
    .eq("athlete_id", athlete.id)
    .single();

  return { workout, score };
};
