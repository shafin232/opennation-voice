export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: string
          id: string
          performed_by: string | null
          performed_by_role: string
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: string
          id?: string
          performed_by?: string | null
          performed_by_role?: string
          target_id?: string
          target_type?: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: string
          id?: string
          performed_by?: string | null
          performed_by_role?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          body: string
          created_at: string
          id: string
          report_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          report_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          report_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      community_repairs: {
        Row: {
          address: string | null
          author_id: string
          category: string
          created_at: string
          description: string
          district: string
          id: string
          lat: number | null
          lng: number | null
          status: string
          support_count: number
          title: string
          upazila: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          author_id: string
          category?: string
          created_at?: string
          description: string
          district?: string
          id?: string
          lat?: number | null
          lng?: number | null
          status?: string
          support_count?: number
          title: string
          upazila?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          author_id?: string
          category?: string
          created_at?: string
          description?: string
          district?: string
          id?: string
          lat?: number | null
          lng?: number | null
          status?: string
          support_count?: number
          title?: string
          upazila?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      crisis_mode: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          active: boolean
          id: string
          reason: string | null
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          active?: boolean
          id?: string
          reason?: string | null
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          active?: boolean
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      evidence: {
        Row: {
          blurred: boolean
          created_at: string
          id: string
          report_id: string
          type: string
          url: string
        }
        Insert: {
          blurred?: boolean
          created_at?: string
          id?: string
          report_id: string
          type?: string
          url: string
        }
        Update: {
          blurred?: boolean
          created_at?: string
          id?: string
          report_id?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          available_beds: number
          district: string
          id: string
          last_updated: string
          name: string
          rating: number
          services: string[]
          total_beds: number
          type: string
        }
        Insert: {
          available_beds?: number
          district?: string
          id?: string
          last_updated?: string
          name: string
          rating?: number
          services?: string[]
          total_beds?: number
          type?: string
        }
        Update: {
          available_beds?: number
          district?: string
          id?: string
          last_updated?: string
          name?: string
          rating?: number
          services?: string[]
          total_beds?: number
          type?: string
        }
        Relationships: []
      }
      identity_unlock_requests: {
        Row: {
          approved_by: string | null
          created_at: string
          id: string
          reason: string
          requested_by: string
          status: string
          target_user_id: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          id?: string
          reason: string
          requested_by: string
          status?: string
          target_user_id: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          id?: string
          reason?: string
          requested_by?: string
          status?: string
          target_user_id?: string
        }
        Relationships: []
      }
      integrity_metrics: {
        Row: {
          active_projects: number
          district: string
          id: string
          resolved_reports: number
          rti_response_rate: number
          total_reports: number
          trust_score: number
          truth_score: number
          updated_at: string
          verified_reports: number
        }
        Insert: {
          active_projects?: number
          district: string
          id?: string
          resolved_reports?: number
          rti_response_rate?: number
          total_reports?: number
          trust_score?: number
          truth_score?: number
          updated_at?: string
          verified_reports?: number
        }
        Update: {
          active_projects?: number
          district?: string
          id?: string
          resolved_reports?: number
          rti_response_rate?: number
          total_reports?: number
          trust_score?: number
          truth_score?: number
          updated_at?: string
          verified_reports?: number
        }
        Relationships: []
      }
      moderation_queue: {
        Row: {
          flag_reason: string
          flagged_at: string
          flagged_by: string
          id: string
          report_id: string
          status: string
        }
        Insert: {
          flag_reason: string
          flagged_at?: string
          flagged_by: string
          id?: string
          report_id: string
          status?: string
        }
        Update: {
          flag_reason?: string
          flagged_at?: string
          flagged_by?: string
          id?: string
          report_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_queue_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          district: string
          effective_trust: number | null
          email: string | null
          id: string
          language: string
          name: string
          phone: string | null
          reputation_raw: number | null
          trust_score: number
          truth_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          district?: string
          effective_trust?: number | null
          email?: string | null
          id?: string
          language?: string
          name?: string
          phone?: string | null
          reputation_raw?: number | null
          trust_score?: number
          truth_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          district?: string
          effective_trust?: number | null
          email?: string | null
          id?: string
          language?: string
          name?: string
          phone?: string | null
          reputation_raw?: number | null
          trust_score?: number
          truth_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_opinions: {
        Row: {
          created_at: string
          id: string
          opinion: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opinion: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opinion?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_opinions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          approval_status: string
          budget: number
          created_at: string
          department: string
          description: string
          district: string
          end_date: string | null
          id: string
          is_frozen: boolean
          opinion_count: number
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approval_status?: string
          budget?: number
          created_at?: string
          department?: string
          description: string
          district?: string
          end_date?: string | null
          id?: string
          is_frozen?: boolean
          opinion_count?: number
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approval_status?: string
          budget?: number
          created_at?: string
          department?: string
          description?: string
          district?: string
          end_date?: string | null
          id?: string
          is_frozen?: boolean
          opinion_count?: number
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          address: string | null
          approval_decision: string | null
          authenticity_score: number | null
          author_id: string
          category: string
          comment_count: number
          created_at: string
          description: string
          district: string
          doubt_count: number
          id: string
          lat: number | null
          lng: number | null
          status: string
          support_count: number
          title: string
          truth_probability: number | null
          upazila: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          approval_decision?: string | null
          authenticity_score?: number | null
          author_id: string
          category?: string
          comment_count?: number
          created_at?: string
          description: string
          district?: string
          doubt_count?: number
          id?: string
          lat?: number | null
          lng?: number | null
          status?: string
          support_count?: number
          title: string
          truth_probability?: number | null
          upazila?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          approval_decision?: string | null
          authenticity_score?: number | null
          author_id?: string
          category?: string
          comment_count?: number
          created_at?: string
          description?: string
          district?: string
          doubt_count?: number
          id?: string
          lat?: number | null
          lng?: number | null
          status?: string
          support_count?: number
          title?: string
          truth_probability?: number | null
          upazila?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rti_requests: {
        Row: {
          body: string
          created_at: string
          department: string
          id: string
          response: string | null
          status: string
          subject: string
          submitted_by: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          department?: string
          id?: string
          response?: string | null
          status?: string
          subject: string
          submitted_by: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          department?: string
          id?: string
          response?: string | null
          status?: string
          subject?: string
          submitted_by?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenders: {
        Row: {
          actual_cost: number
          awarded_to: string
          bid_rotation_risk: number | null
          created_at: string
          department: string
          estimated_cost: number
          execution_risk: number | null
          hhi_index: number | null
          id: string
          risk_factors: string[]
          risk_score: number
          status: string
          tender_title: string
          win_rate_anomaly: number | null
        }
        Insert: {
          actual_cost?: number
          awarded_to?: string
          bid_rotation_risk?: number | null
          created_at?: string
          department?: string
          estimated_cost?: number
          execution_risk?: number | null
          hhi_index?: number | null
          id?: string
          risk_factors?: string[]
          risk_score?: number
          status?: string
          tender_title: string
          win_rate_anomaly?: number | null
        }
        Update: {
          actual_cost?: number
          awarded_to?: string
          bid_rotation_risk?: number | null
          created_at?: string
          department?: string
          estimated_cost?: number
          execution_risk?: number | null
          hhi_index?: number | null
          id?: string
          risk_factors?: string[]
          risk_score?: number
          status?: string
          tender_title?: string
          win_rate_anomaly?: number | null
        }
        Relationships: []
      }
      user_actions: {
        Row: {
          action_type: string
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          target_id: string
          target_type: string
          user_id: string
          weight: number
        }
        Insert: {
          action_type?: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          target_id: string
          target_type?: string
          user_id: string
          weight?: number
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          target_id?: string
          target_type?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vote_anomalies: {
        Row: {
          anomaly_type: string
          details: string
          detected_at: string
          id: string
          report_id: string
          report_title: string
          severity: string
        }
        Insert: {
          anomaly_type: string
          details?: string
          detected_at?: string
          id?: string
          report_id: string
          report_title?: string
          severity?: string
        }
        Update: {
          anomaly_type?: string
          details?: string
          detected_at?: string
          id?: string
          report_id?: string
          report_title?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "vote_anomalies_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string
          id: string
          report_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          report_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          report_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "citizen" | "moderator" | "admin" | "superadmin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["citizen", "moderator", "admin", "superadmin"],
    },
  },
} as const
