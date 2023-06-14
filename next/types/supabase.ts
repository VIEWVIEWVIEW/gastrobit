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
        Relationships: [
          {
            foreignKeyName: "custom_domains_restaurant_id_fkey"
            columns: ["restaurant_id"]
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_domains_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
          stripe_account_id: string | null
          subdomain: string | null
          theme: string
        }
        Insert: {
          created_at?: string | null
          demo?: boolean
          extra_presets?: Json
          id?: number
          karte?: Json | null
          name: string
          owner_id: string
          stripe_account_id?: string | null
          subdomain?: string | null
          theme?: string
        }
        Update: {
          created_at?: string | null
          demo?: boolean
          extra_presets?: Json
          id?: number
          karte?: Json | null
          name?: string
          owner_id?: string
          stripe_account_id?: string | null
          subdomain?: string | null
          theme?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
