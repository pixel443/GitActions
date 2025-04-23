export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          created_at: string
          name: string
          repository: string
          description: string | null
          user_id: string
          webhook_id: string | null
          webhook_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          repository: string
          description?: string | null
          user_id: string
          webhook_id?: string | null
          webhook_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          repository?: string
          description?: string | null
          user_id?: string
          webhook_id?: string | null
          webhook_url?: string | null
        }
      }
      events: {
        Row: {
          id: string
          created_at: string
          project_id: string
          event_type: string
          code_file_path: string
          description: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          event_type: string
          code_file_path: string
          description?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          event_type?: string
          code_file_path?: string
          description?: string | null
          is_active?: boolean
        }
      }
      event_logs: {
        Row: {
          id: string
          created_at: string
          event_id: string
          payload: Json
          status: string
          error_message: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          event_id: string
          payload: Json
          status: string
          error_message?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          event_id?: string
          payload?: Json
          status?: string
          error_message?: string | null
        }
      }
    }
  }
}