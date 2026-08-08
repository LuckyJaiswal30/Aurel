export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          answering_since: string | null;
          answering_step: string | null;
          created_at: string;
          id: string;
          subject_id: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          answering_since?: string | null;
          answering_step?: string | null;
          created_at?: string;
          id?: string;
          subject_id?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          answering_since?: string | null;
          answering_step?: string | null;
          created_at?: string;
          id?: string;
          subject_id?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_subject_id_user_id_fkey";
            columns: ["subject_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      document_chunks: {
        Row: {
          content: string;
          context_note: string | null;
          created_at: string;
          document_id: string;
          embedding: string | null;
          heading: string | null;
          id: string;
          page_number: number;
          position: number;
          search_text: unknown;
          section_id: string;
          subject_id: string;
          token_count: number | null;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          content: string;
          context_note?: string | null;
          created_at?: string;
          document_id: string;
          embedding?: string | null;
          heading?: string | null;
          id?: string;
          page_number: number;
          position: number;
          search_text?: never;
          section_id: string;
          subject_id: string;
          token_count?: number | null;
          user_id: string;
        };
        Update: {
          content?: string;
          context_note?: string | null;
          created_at?: string;
          document_id?: string;
          embedding?: string | null;
          heading?: string | null;
          id?: string;
          page_number?: number;
          position?: number;
          search_text?: never;
          section_id?: string;
          subject_id?: string;
          token_count?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_user_id_subject_id_fkey";
            columns: ["document_id", "user_id", "subject_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id", "user_id", "subject_id"];
          },
          {
            foreignKeyName: "document_chunks_section_id_document_id_fkey";
            columns: ["section_id", "document_id"];
            isOneToOne: false;
            referencedRelation: "document_sections";
            referencedColumns: ["id", "document_id"];
          },
        ];
      };
      document_sections: {
        Row: {
          content: string;
          created_at: string;
          document_id: string;
          heading_path: string[];
          id: string;
          page_end: number;
          page_start: number;
          position: number;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          content: string;
          created_at?: string;
          document_id: string;
          heading_path?: string[];
          id?: string;
          page_end: number;
          page_start: number;
          position: number;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          document_id?: string;
          heading_path?: string[];
          id?: string;
          page_end?: number;
          page_start?: number;
          position?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "document_sections_document_id_user_id_fkey";
            columns: ["document_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      documents: {
        Row: {
          content_hash: string;
          created_at: string;
          file_name: string;
          id: string;
          mime_type: string;
          page_count: number | null;
          size_bytes: number;
          status: Database["public"]["Enums"]["document_status"];
          status_detail: string | null;
          storage_path: string;
          subject_id: string;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          content_hash: string;
          created_at?: string;
          file_name: string;
          id?: string;
          mime_type: string;
          page_count?: number | null;
          size_bytes: number;
          status?: Database["public"]["Enums"]["document_status"];
          status_detail?: string | null;
          storage_path: string;
          subject_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content_hash?: string;
          created_at?: string;
          file_name?: string;
          id?: string;
          mime_type?: string;
          page_count?: number | null;
          size_bytes?: number;
          status?: Database["public"]["Enums"]["document_status"];
          status_detail?: string | null;
          storage_path?: string;
          subject_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_subject_id_user_id_fkey";
            columns: ["subject_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      guardrail_events: {
        Row: {
          category: string;
          created_at: string;
          id: number;
          is_strike: boolean;
          layer: number;
          outcome: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          category: string;
          created_at?: string;
          id?: never;
          is_strike?: boolean;
          layer: number;
          outcome: string;
          user_id?: string | null;
        };
        Update: {
          category?: string;
          created_at?: string;
          id?: never;
          is_strike?: boolean;
          layer?: number;
          outcome?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      message_feedback: {
        Row: {
          comment: string | null;
          created_at: string;
          is_wrong: boolean;
          message_id: string;
          rating: number | null;
          reasons: string[];
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          comment?: string | null;
          created_at?: string;
          is_wrong?: boolean;
          message_id: string;
          rating?: number | null;
          reasons?: string[];
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          is_wrong?: boolean;
          message_id?: string;
          rating?: number | null;
          reasons?: string[];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "message_feedback_message_id_user_id_fkey";
            columns: ["message_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "messages";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      messages: {
        Row: {
          answer_format: string | null;
          answer_source: Database["public"]["Enums"]["answer_source"] | null;
          citations: NonNullable<Json>;
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["message_role"];
          understood_question: string | null;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          answer_format?: string | null;
          answer_source?: Database["public"]["Enums"]["answer_source"] | null;
          citations?: NonNullable<Json>;
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["message_role"];
          understood_question?: string | null;
          user_id: string;
        };
        Update: {
          answer_format?: string | null;
          answer_source?: Database["public"]["Enums"]["answer_source"] | null;
          citations?: NonNullable<Json>;
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["message_role"];
          understood_question?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_user_id_fkey";
            columns: ["conversation_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_path: string | null;
          course: string | null;
          created_at: string;
          display_name: string | null;
          explanation_level: Database["public"]["Enums"]["explanation_level"];
          id: string;
          preferred_language: Database["public"]["Enums"]["answer_language"];
          study_year: number | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          avatar_path?: string | null;
          course?: string | null;
          created_at?: string;
          display_name?: string | null;
          explanation_level?: Database["public"]["Enums"]["explanation_level"];
          id: string;
          preferred_language?: Database["public"]["Enums"]["answer_language"];
          study_year?: number | null;
          updated_at?: string;
        };
        Update: {
          avatar_path?: string | null;
          course?: string | null;
          created_at?: string;
          display_name?: string | null;
          explanation_level?: Database["public"]["Enums"]["explanation_level"];
          id?: string;
          preferred_language?: Database["public"]["Enums"]["answer_language"];
          study_year?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      subjects: {
        Row: {
          created_at: string;
          description: string | null;
          exam_date: string | null;
          id: string;
          name: string;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          description?: string | null;
          exam_date?: string | null;
          id?: string;
          name: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          exam_date?: string | null;
          id?: string;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      usage_counters: {
        Row: {
          action: string;
          limit_key: string;
          used_count: number;
          window_seconds: number;
          window_start: string;
        };
        ComputedFields: never;
        Insert: {
          action: string;
          limit_key: string;
          used_count?: number;
          window_seconds: number;
          window_start: string;
        };
        Update: {
          action?: string;
          limit_key?: string;
          used_count?: number;
          window_seconds?: number;
          window_start?: string;
        };
        Relationships: [];
      };
      user_restrictions: {
        Row: {
          cooldown_until: string | null;
          daily_limit_override: number | null;
          strike_count: number;
          suspended_at: string | null;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          cooldown_until?: string | null;
          daily_limit_override?: number | null;
          strike_count?: number;
          suspended_at?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cooldown_until?: string | null;
          daily_limit_override?: number | null;
          strike_count?: number;
          suspended_at?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      claim_note_job: {
        Args: {
          from_statuses: Database["public"]["Enums"]["document_status"][];
          note_id: string;
          stuck_before: string;
          stuck_statuses: Database["public"]["Enums"]["document_status"][];
          student_id: string;
          to_status: Database["public"]["Enums"]["document_status"];
        };
        Returns: boolean;
      };
      consume_usage: {
        Args: {
          cost: number;
          max_count: number;
          usage_action: string;
          usage_key: string;
          window_seconds: number;
        };
        Returns: {
          is_allowed: boolean;
          resets_at: string;
          used_count: number;
        }[];
      };
      consume_usage_batch: {
        Args: {
          cost: number;
          max_counts: number[];
          usage_action: string;
          usage_keys: string[];
          window_lengths: number[];
        };
        Returns: {
          denied_index: number;
          is_allowed: boolean;
        }[];
      };
      read_guardrail_state: {
        Args: { student_id: string };
        Returns: {
          cooldown_until: string;
          daily_limit: number;
          is_suspended: boolean;
        }[];
      };
      record_guardrail_event: {
        Args: {
          counts_as_strike: boolean;
          event_category: string;
          event_layer: number;
          event_outcome: string;
          student_id: string;
        };
        Returns: {
          cooldown_until: string;
          is_suspended: boolean;
          strikes_today: number;
        }[];
      };
      search_chunks: {
        Args: {
          match_count?: number;
          query_embedding: string;
          query_text: string;
          student_id: string;
          subject_id: string;
        };
        Returns: {
          chunk_id: string;
          score: number;
        }[];
      };
      study_file_mime_types: {
        Args: Record<PropertyKey, never>;
        Returns: string[];
      };
      study_file_size_limit: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
    };
    Enums: {
      answer_language: "english" | "hindi" | "hinglish";
      answer_source:
        "notes" | "reference_library" | "general_knowledge" | "redirect";
      document_status:
        | "uploaded"
        | "checking"
        | "held_for_confirmation"
        | "rejected"
        | "reading"
        | "indexing"
        | "ready"
        | "failed";
      explanation_level: "simpler" | "standard" | "deeper";
      message_role: "student" | "tutor";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      answer_language: ["english", "hindi", "hinglish"],
      answer_source: [
        "notes",
        "reference_library",
        "general_knowledge",
        "redirect",
      ],
      document_status: [
        "uploaded",
        "checking",
        "held_for_confirmation",
        "rejected",
        "reading",
        "indexing",
        "ready",
        "failed",
      ],
      explanation_level: ["simpler", "standard", "deeper"],
      message_role: ["student", "tutor"],
    },
  },
} as const;
