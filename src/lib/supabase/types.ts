export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      responses: {
        Row: {
          id: string;
          created_at: string;
          session_id: string;
          answers: Json;
          metadata: Json;
          consent_given: boolean;
          consent_timestamp: string | null;
          consent_version: string | null;
          anonymous_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          session_id: string;
          answers: Json;
          metadata?: Json;
          consent_given: boolean;
          consent_timestamp?: string | null;
          consent_version?: string | null;
          anonymous_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          session_id?: string;
          answers?: Json;
          metadata?: Json;
          consent_given?: boolean;
          consent_timestamp?: string | null;
          consent_version?: string | null;
          anonymous_id?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          started_at: string;
          completed_at: string | null;
          language: string;
          user_agent: string | null;
          partial_answers: Json;
          last_question_index: number;
          is_complete: boolean;
        };
        Insert: {
          id?: string;
          started_at?: string;
          completed_at?: string | null;
          language: string;
          user_agent?: string | null;
          partial_answers?: Json;
          last_question_index?: number;
          is_complete?: boolean;
        };
        Update: {
          id?: string;
          started_at?: string;
          completed_at?: string | null;
          language?: string;
          user_agent?: string | null;
          partial_answers?: Json;
          last_question_index?: number;
          is_complete?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Response = Database['public']['Tables']['responses']['Row'];
export type Session = Database['public']['Tables']['sessions']['Row'];
export type InsertResponse = Database['public']['Tables']['responses']['Insert'];
export type InsertSession = Database['public']['Tables']['sessions']['Insert'];
