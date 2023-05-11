export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      custom_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: number
          restaurant_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: number
          restaurant_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: number
          restaurant_id?: number
          user_id?: string
        }
      }
      restaurants: {
        Row: {
          created_at: string | null
          demo: boolean
          extra_presets: Json
          id: number
          karte: Json | null
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string | null
          demo?: boolean
          extra_presets?: Json
          id?: number
          karte?: Json | null
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string | null
          demo?: boolean
          extra_presets?: Json
          id?: number
          karte?: Json | null
          name?: string
          owner_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      json_matches_schema: {
        Args: {
          schema: Json
          instance: Json
        }
        Returns: boolean
      }
      jsonb_matches_schema: {
        Args: {
          schema: Json
          instance: Json
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
