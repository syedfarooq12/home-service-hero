export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          position: string
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          position?: string
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          position?: string
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          address: string
          amount: number | null
          city: string
          created_at: string
          customer_email: string | null
          customer_latitude: number | null
          customer_longitude: number | null
          customer_name: string
          customer_phone: string
          description: string | null
          estimated_arrival_time: string | null
          id: string
          notes: string | null
          payment_status: string | null
          pincode: string
          scheduled_date: string
          scheduled_time: string
          service_category: string
          service_name: string
          state: string
          status: string
          technician_id: string | null
          technician_location_lat: number | null
          technician_location_lng: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          amount?: number | null
          city: string
          created_at?: string
          customer_email?: string | null
          customer_latitude?: number | null
          customer_longitude?: number | null
          customer_name: string
          customer_phone: string
          description?: string | null
          estimated_arrival_time?: string | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          pincode: string
          scheduled_date: string
          scheduled_time: string
          service_category: string
          service_name: string
          state: string
          status?: string
          technician_id?: string | null
          technician_location_lat?: number | null
          technician_location_lng?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          amount?: number | null
          city?: string
          created_at?: string
          customer_email?: string | null
          customer_latitude?: number | null
          customer_longitude?: number | null
          customer_name?: string
          customer_phone?: string
          description?: string | null
          estimated_arrival_time?: string | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          pincode?: string
          scheduled_date?: string
          scheduled_time?: string
          service_category?: string
          service_name?: string
          state?: string
          status?: string
          technician_id?: string | null
          technician_location_lat?: number | null
          technician_location_lng?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technician_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          available_locations: string[] | null
          category: string
          created_at: string
          description: string | null
          duration: string | null
          id: string
          image_url: string | null
          includes: string[] | null
          is_active: boolean
          is_hidden: boolean
          name: string
          original_price: number | null
          price: number
          rating: number | null
          reviews_count: number | null
          updated_at: string
        }
        Insert: {
          available_locations?: string[] | null
          category: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean
          is_hidden?: boolean
          name: string
          original_price?: number | null
          price: number
          rating?: number | null
          reviews_count?: number | null
          updated_at?: string
        }
        Update: {
          available_locations?: string[] | null
          category?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean
          is_hidden?: boolean
          name?: string
          original_price?: number | null
          price?: number
          rating?: number | null
          reviews_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          ai_suggestions: Json | null
          category: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          source_image_url: string | null
          source_type: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_suggestions?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          source_image_url?: string | null
          source_type?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_suggestions?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          source_image_url?: string | null
          source_type?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      technician_locations: {
        Row: {
          booking_id: string | null
          created_at: string
          eta_minutes: number | null
          id: string
          last_checkin_at: string
          latitude: number
          longitude: number
          status: string
          technician_id: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          eta_minutes?: number | null
          id?: string
          last_checkin_at?: string
          latitude: number
          longitude: number
          status?: string
          technician_id: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          eta_minutes?: number | null
          id?: string
          last_checkin_at?: string
          latitude?: number
          longitude?: number
          status?: string
          technician_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_locations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_profiles: {
        Row: {
          address: string
          background_check_consent: boolean | null
          bank_account_holder_name: string | null
          bank_account_number: string | null
          bank_ifsc_code: string | null
          certifications: string[] | null
          city: string
          created_at: string
          full_name: string
          id: string
          id_document_type: string | null
          id_document_url: string | null
          is_available: boolean | null
          kyc_rejection_reason: string | null
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          latitude: number | null
          longitude: number | null
          phone: string
          pincode: string
          service_radius_km: number | null
          skills: string[] | null
          state: string
          updated_at: string
          user_id: string
          years_of_experience: number | null
        }
        Insert: {
          address: string
          background_check_consent?: boolean | null
          bank_account_holder_name?: string | null
          bank_account_number?: string | null
          bank_ifsc_code?: string | null
          certifications?: string[] | null
          city: string
          created_at?: string
          full_name: string
          id?: string
          id_document_type?: string | null
          id_document_url?: string | null
          is_available?: boolean | null
          kyc_rejection_reason?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          latitude?: number | null
          longitude?: number | null
          phone: string
          pincode: string
          service_radius_km?: number | null
          skills?: string[] | null
          state: string
          updated_at?: string
          user_id: string
          years_of_experience?: number | null
        }
        Update: {
          address?: string
          background_check_consent?: boolean | null
          bank_account_holder_name?: string | null
          bank_account_number?: string | null
          bank_ifsc_code?: string | null
          certifications?: string[] | null
          city?: string
          created_at?: string
          full_name?: string
          id?: string
          id_document_type?: string | null
          id_document_url?: string | null
          is_available?: boolean | null
          kyc_rejection_reason?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          latitude?: number | null
          longitude?: number | null
          phone?: string
          pincode?: string
          service_radius_km?: number | null
          skills?: string[] | null
          state?: string
          updated_at?: string
          user_id?: string
          years_of_experience?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "technician" | "admin"
      kyc_status: "pending" | "submitted" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["customer", "technician", "admin"],
      kyc_status: ["pending", "submitted", "approved", "rejected"],
    },
  },
} as const
