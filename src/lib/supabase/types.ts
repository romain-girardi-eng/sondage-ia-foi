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
        Relationships: [];
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
          /** Attrition strata, carried by the session itself (migration 012). */
          instrument_version: string | null;
          entry_variant: string | null;
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
          instrument_version?: string | null;
          entry_variant?: string | null;
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
          instrument_version?: string | null;
          entry_variant?: string | null;
        };
        Relationships: [];
      };
      attrition_snapshots: {
        Row: {
          id: string;
          snapshot_at: string;
          instrument_version: string | null;
          entry_variant: string | null;
          /** Number of answered items at abandonment, as text (migration 012). */
          last_question_id: string | null;
          sessions: number;
        };
        Insert: {
          id?: string;
          snapshot_at?: string;
          instrument_version?: string | null;
          entry_variant?: string | null;
          last_question_id?: string | null;
          sessions: number;
        };
        Update: {
          id?: string;
          snapshot_at?: string;
          instrument_version?: string | null;
          entry_variant?: string | null;
          last_question_id?: string | null;
          sessions?: number;
        };
        Relationships: [];
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
        Relationships: [];
      };
      security_audit_log: {
        Row: {
          id: string;
          created_at: string;
          operation: string;
          table_name: string | null;
          record_id: string | null;
          anonymous_id: string | null;
          ip_hash: string | null;
          user_agent_hash: string | null;
          success: boolean;
          error_message: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          operation: string;
          table_name?: string | null;
          record_id?: string | null;
          anonymous_id?: string | null;
          ip_hash?: string | null;
          user_agent_hash?: string | null;
          success?: boolean;
          error_message?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          operation?: string;
          table_name?: string | null;
          record_id?: string | null;
          anonymous_id?: string | null;
          ip_hash?: string | null;
          user_agent_hash?: string | null;
          success?: boolean;
          error_message?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      submission_tracking: {
        Row: {
          id: string;
          created_at: string;
          fingerprint_id: string | null;
          ip_address: string | null;
          anonymous_id: string | null;
          session_id: string | null;
          is_successful: boolean;
          blocked_reason: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          fingerprint_id?: string | null;
          ip_address?: string | null;
          anonymous_id?: string | null;
          session_id?: string | null;
          is_successful?: boolean;
          blocked_reason?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          fingerprint_id?: string | null;
          ip_address?: string | null;
          anonymous_id?: string | null;
          session_id?: string | null;
          is_successful?: boolean;
          blocked_reason?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      email_hashes: {
        Row: {
          id: string;
          created_at: string;
          email_hash: string;
          response_id: string | null;
          ip_hash: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          email_hash: string;
          response_id?: string | null;
          ip_hash?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          email_hash?: string;
          response_id?: string | null;
          ip_hash?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      security_dashboard: {
        Row: {
          hour: string;
          operation: string;
          event_count: number;
          unique_users: number;
          unique_ips: number;
          failure_count: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_aggregated_results: {
        Args: Record<string, never>;
        Returns: {
          question_id: string;
          distribution: Json;
          total_responses: number;
        }[];
      };
      get_participant_count: {
        Args: Record<string, never>;
        Returns: number;
      };
      check_submission_allowed: {
        Args: {
          p_fingerprint_id: string | null;
          p_ip_address: string | null;
          p_anonymous_id: string;
        };
        Returns: {
          allowed: boolean;
          reason: string | null;
          previous_submission_at: string | null;
        }[];
      };
      record_submission_attempt: {
        Args: {
          p_fingerprint_id: string | null;
          p_ip_address: string | null;
          p_anonymous_id: string;
          p_session_id: string | null;
          p_is_successful: boolean;
          p_blocked_reason?: string | null;
          p_user_agent?: string | null;
        };
        Returns: string;
      };
      check_email_hash_exists: {
        Args: {
          p_email_hash: string;
        };
        Returns: boolean;
      };
      record_email_hash: {
        Args: {
          p_email_hash: string;
          p_response_id?: string | null;
          p_ip_hash?: string | null;
        };
        Returns: string | null;
      };
      get_user_responses: {
        Args: {
          p_anonymous_id: string;
          p_ip_hash?: string | null;
        };
        Returns: {
          id: string;
          created_at: string;
          answers: Json;
          metadata: Json;
        }[];
      };
      delete_user_data: {
        Args: {
          p_anonymous_id: string;
          p_ip_hash?: string | null;
        };
        Returns: {
          deleted_responses: number;
          deleted_sessions: number;
          deleted_email_submissions: number;
          deleted_submission_tracking: number;
          deleted_email_hashes: number;
          anonymized_audit_log: number;
        }[];
      };
      export_user_data: {
        Args: {
          p_anonymous_id: string;
          p_ip_hash?: string | null;
        };
        Returns: Json;
      };
      get_session_partial: {
        Args: {
          p_session_id: string;
        };
        Returns: {
          id: string;
          started_at: string;
          completed_at: string | null;
          language: string;
          user_agent: string | null;
          partial_answers: Json;
          last_question_index: number;
          is_complete: boolean;
        }[];
      };
      purge_expired_data: {
        Args: Record<string, never>;
        Returns: {
          purged_sessions: number;
          purged_submission_tracking: number;
          purged_audit_log: number;
        }[];
      };
      snapshot_attrition: {
        Args: Record<string, never>;
        Returns: {
          snapshot_rows: number;
          archived_sessions: number;
        }[];
      };
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
