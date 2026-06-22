export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      units: {
        Row: {
          id: string
          unit_number: string
          unit_type: 'apartment' | 'house' | 'local'
          aliquot_percentage: number
          floor_number: number | null
          status: 'active' | 'inactive'
          created_at: string
        }
        Insert: {
          id?: string
          unit_number: string
          unit_type?: 'apartment' | 'house' | 'local'
          aliquot_percentage: number
          floor_number?: number | null
          status?: 'active' | 'inactive'
          created_at?: string
        }
        Update: {
          id?: string
          unit_number?: string
          unit_type?: 'apartment' | 'house' | 'local'
          aliquot_percentage?: number
          floor_number?: number | null
          status?: 'active' | 'inactive'
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'resident'
          unit_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'resident'
          unit_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'resident'
          unit_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          unit_id: string
          profile_id: string
          amount: number
          currency: 'USD'
          status: 'pending' | 'verified' | 'rejected'
          payment_date: string
          reference_number: string | null
          receipt_url: string | null
          period: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          unit_id: string
          profile_id: string
          amount: number
          currency?: 'USD'
          status?: 'pending' | 'verified' | 'rejected'
          payment_date: string
          reference_number?: string | null
          receipt_url?: string | null
          period: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          unit_id?: string
          profile_id?: string
          amount?: number
          currency?: 'USD'
          status?: 'pending' | 'verified' | 'rejected'
          payment_date?: string
          reference_number?: string | null
          receipt_url?: string | null
          period?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      common_expenses: {
        Row: {
          id: string
          title: string
          description: string | null
          total_amount: number
          currency: string
          category: 'maintenance' | 'utilities' | 'security' | 'admin' | 'other'
          expense_date: string
          period: string
          receipt_url: string | null
          is_distributed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          total_amount: number
          currency?: string
          category?: 'maintenance' | 'utilities' | 'security' | 'admin' | 'other'
          expense_date: string
          period: string
          receipt_url?: string | null
          is_distributed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          total_amount?: number
          currency?: string
          category?: 'maintenance' | 'utilities' | 'security' | 'admin' | 'other'
          expense_date?: string
          period?: string
          receipt_url?: string | null
          is_distributed?: boolean
          created_at?: string
        }
      }
      expense_distributions: {
        Row: {
          id: string
          expense_id: string
          unit_id: string
          assigned_amount: number
          aliquot_percentage: number
          created_at: string
        }
        Insert: {
          id?: string
          expense_id: string
          unit_id: string
          assigned_amount: number
          aliquot_percentage: number
          created_at?: string
        }
        Update: {
          id?: string
          expense_id?: string
          unit_id?: string
          assigned_amount?: number
          aliquot_percentage?: number
          created_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          author_id: string
          title: string
          content: string
          priority: 'low' | 'medium' | 'high' | 'urgent'
          is_pinned: boolean
          published_at: string
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          content: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          is_pinned?: boolean
          published_at?: string
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          content?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          is_pinned?: boolean
          published_at?: string
          expires_at?: string | null
          created_at?: string
        }
      }
      amenities: {
        Row: {
          id: string
          name: string
          description: string | null
          capacity: number
          rules: string | null
          image_url: string | null
          status: 'available' | 'maintenance' | 'inactive'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          capacity: number
          rules?: string | null
          image_url?: string | null
          status?: 'available' | 'maintenance' | 'inactive'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          capacity?: number
          rules?: string | null
          image_url?: string | null
          status?: 'available' | 'maintenance' | 'inactive'
          created_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          amenity_id: string
          unit_id: string
          profile_id: string
          reservation_date: string
          start_time: string
          end_time: string
          status: 'pending' | 'approved' | 'rejected' | 'cancelled'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          amenity_id: string
          unit_id: string
          profile_id: string
          reservation_date: string
          start_time: string
          end_time: string
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          amenity_id?: string
          unit_id?: string
          profile_id?: string
          reservation_date?: string
          start_time?: string
          end_time?: string
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      distribute_expense: {
        Args: { p_expense_id: string }
        Returns: void
      }
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_my_unit_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: { [_ in never]: never }
  }
}

// Convenience aliases
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Unit = Tables<'units'>
export type Profile = Tables<'profiles'>
export type Payment = Tables<'payments'>
export type CommonExpense = Tables<'common_expenses'>
export type ExpenseDistribution = Tables<'expense_distributions'>
export type Announcement = Tables<'announcements'>
export type Amenity = Tables<'amenities'>
export type Reservation = Tables<'reservations'>
