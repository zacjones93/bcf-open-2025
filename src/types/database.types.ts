export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      athlete_points: {
        Row: {
          athlete_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          point_assignment_id: string | null
          point_type_id: string | null
          points: number
          updated_at: string | null
          workout_id: string | null
        }
        Insert: {
          athlete_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          point_assignment_id?: string | null
          point_type_id?: string | null
          points?: number
          updated_at?: string | null
          workout_id?: string | null
        }
        Update: {
          athlete_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          point_assignment_id?: string | null
          point_type_id?: string | null
          points?: number
          updated_at?: string | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_points_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_points_point_assignment_id_fkey"
            columns: ["point_assignment_id"]
            isOneToOne: false
            referencedRelation: "point_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_points_point_type_id_fkey"
            columns: ["point_type_id"]
            isOneToOne: false
            referencedRelation: "point_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_points_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_score: {
        Row: {
          athlete_id: string | null
          created_at: string
          id: number
          notes: string | null
          score: string | null
          updated_at: string | null
          workout_id: string
        }
        Insert: {
          athlete_id?: string | null
          created_at?: string
          id?: number
          notes?: string | null
          score?: string | null
          updated_at?: string | null
          workout_id: string
        }
        Update: {
          athlete_id?: string | null
          created_at?: string
          id?: number
          notes?: string | null
          score?: string | null
          updated_at?: string | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_score_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_score_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_teams: {
        Row: {
          assigned_at: string | null
          athlete_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          athlete_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          athlete_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_teams_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      athletes: {
        Row: {
          athlete_division:
            | Database["public"]["Enums"]["athlete_division"]
            | null
          created_at: string | null
          crossfit_id: string
          email: string
          id: string
          name: string
          type: Database["public"]["Enums"]["athlete type"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          athlete_division?:
            | Database["public"]["Enums"]["athlete_division"]
            | null
          created_at?: string | null
          crossfit_id: string
          email: string
          id?: string
          name: string
          type?: Database["public"]["Enums"]["athlete type"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          athlete_division?:
            | Database["public"]["Enums"]["athlete_division"]
            | null
          created_at?: string | null
          crossfit_id?: string
          email?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["athlete type"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      point_assignments: {
        Row: {
          assignee_id: string | null
          assigner_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          point_type_id: string | null
          points: number
          updated_at: string | null
          workout_id: string | null
        }
        Insert: {
          assignee_id?: string | null
          assigner_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          point_type_id?: string | null
          points?: number
          updated_at?: string | null
          workout_id?: string | null
        }
        Update: {
          assignee_id?: string | null
          assigner_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          point_type_id?: string | null
          points?: number
          updated_at?: string | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "point_assignments_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_assignments_assigner_id_fkey"
            columns: ["assigner_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_assignments_point_type_id_fkey"
            columns: ["point_type_id"]
            isOneToOne: false
            referencedRelation: "point_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_assignments_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      point_types: {
        Row: {
          category: string
          created_at: string | null
          id: string
          name: string
          points: number
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          name: string
          points?: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          points?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      workouts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          week_number: number
          workout_date: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          week_number: number
          workout_date: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          week_number?: number
          workout_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      "athlete type": "admin" | "captain" | "athlete"
      athlete_division:
        | "open (m)"
        | "open (f)"
        | "scaled (m)"
        | "scaled (f)"
        | "masters (55+ m)"
        | "masters (55+ f)"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
