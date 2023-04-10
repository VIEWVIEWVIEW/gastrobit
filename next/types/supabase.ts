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
      restaurants: {
        Row: {
          created_at: string | null
          demo: boolean
          domains: string[] | null
          id: number
          karte: Json | null
          name: string | null
          owner_id: string
        }
        Insert: {
          created_at?: string | null
          demo?: boolean
          domains?: string[] | null
          id?: number
          karte?: Json | null
          name?: string | null
          owner_id: string
        }
        Update: {
          created_at?: string | null
          demo?: boolean
          domains?: string[] | null
          id?: number
          karte?: Json | null
          name?: string | null
          owner_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
