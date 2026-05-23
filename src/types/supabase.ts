import type { ProcessingStatus } from "@/types/portfolio";

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
      users: {
        Row: {
          id: string;
          github_username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          email: string | null;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          github_username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          github_username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      portfolios: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          hero_title: string | null;
          bio: string | null;
          skills: string[];
          experience: Json;
          projects: Json;
          contact_email: string | null;
          processing_status: ProcessingStatus;
          processing_error: string | null;
          resume_storage_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          hero_title?: string | null;
          bio?: string | null;
          skills?: string[];
          experience?: Json;
          projects?: Json;
          contact_email?: string | null;
          processing_status?: ProcessingStatus;
          processing_error?: string | null;
          resume_storage_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          hero_title?: string | null;
          bio?: string | null;
          skills?: string[];
          experience?: Json;
          projects?: Json;
          contact_email?: string | null;
          processing_status?: ProcessingStatus;
          processing_error?: string | null;
          resume_storage_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolios_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
