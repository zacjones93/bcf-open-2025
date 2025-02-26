import { createServerClient } from "../../server";
import { Tables } from "@/types/database.types";

export type PointType = Tables<"point_types">;

export const getAllPointTypes = async () => {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("point_types")
    .select("*")
    .order("category, name")
    .throwOnError();
  return data;
};


