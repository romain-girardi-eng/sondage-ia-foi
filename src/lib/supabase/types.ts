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
          language: string;  // Required field
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
      email_submissions: {
        Row: {
          id: string;
          created_at: string;
          email_hash: string;
          email_encrypted: string;
          email_iv: string;
          response_id: string | null;
          anonymous_id: string;
          marketing_consent: boolean;
          pdf_sent_at: string | null;
          pdf_send_attempts: number;
          last_error: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          email_hash: string;
          email_encrypted: string;
          email_iv: string;
          response_id?: string | null;
          anonymous_id: string;
          marketing_consent?: boolean;
          pdf_sent_at?: string | null;
          pdf_send_attempts?: number;
          last_error?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          email_hash?: string;
          email_encrypted?: string;
          email_iv?: string;
          response_id?: string | null;
          anonymous_id?: string;
          marketing_consent?: boolean;
          pdf_sent_at?: string | null;
          pdf_send_attempts?: number;
          last_error?: string | null;
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
export type EmailSubmission = Database['public']['Tables']['email_submissions']['Row'];
export type InsertResponse = Database['public']['Tables']['responses']['Insert'];
export type InsertSession = Database['public']['Tables']['sessions']['Insert'];
export type InsertEmailSubmission = Database['public']['Tables']['email_submissions']['Insert'];
