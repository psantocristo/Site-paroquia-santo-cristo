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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      analytics_summary: {
        Row: {
          created_at: string | null
          date: string
          id: string
          top_pages: Json | null
          total_views: number | null
          unique_sessions: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          top_pages?: Json | null
          total_views?: number | null
          unique_sessions?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          top_pages?: Json | null
          total_views?: number | null
          unique_sessions?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          cloudinary_public_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          is_published: boolean | null
          slug: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string
          cloudinary_public_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string | null
          title?: string
          updated_at?: string | null
        }
        Update: {
          author?: string
          cloudinary_public_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      campaign_donations: {
        Row: {
          amount: number
          authorization_code: string | null
          campaign_id: string | null
          card_brand: string | null
          card_last4: string | null
          created_at: string
          donor_email: string | null
          donor_name: string
          donor_phone: string | null
          end_to_end_id: string | null
          id: string
          installments: number | null
          paid_at: string | null
          payment_method: string
          pix_expiration: string | null
          provider_response: Json | null
          qr_code: string | null
          qr_code_image: string | null
          status: string
          txid: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          authorization_code?: string | null
          campaign_id?: string | null
          card_brand?: string | null
          card_last4?: string | null
          created_at?: string
          donor_email?: string | null
          donor_name: string
          donor_phone?: string | null
          end_to_end_id?: string | null
          id?: string
          installments?: number | null
          paid_at?: string | null
          payment_method?: string
          pix_expiration?: string | null
          provider_response?: Json | null
          qr_code?: string | null
          qr_code_image?: string | null
          status?: string
          txid?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          authorization_code?: string | null
          campaign_id?: string | null
          card_brand?: string | null
          card_last4?: string | null
          created_at?: string
          donor_email?: string | null
          donor_name?: string
          donor_phone?: string | null
          end_to_end_id?: string | null
          id?: string
          installments?: number | null
          paid_at?: string | null
          payment_method?: string
          pix_expiration?: string | null
          provider_response?: Json | null
          qr_code?: string | null
          qr_code_image?: string | null
          status?: string
          txid?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          cloudinary_public_id: string | null
          created_at: string | null
          current_amount: number
          description: string
          end_date: string | null
          featured_image: string | null
          goal_amount: number
          id: string
          is_active: boolean | null
          is_published: boolean | null
          slug: string
          start_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cloudinary_public_id?: string | null
          created_at?: string | null
          current_amount?: number
          description?: string
          end_date?: string | null
          featured_image?: string | null
          goal_amount?: number
          id?: string
          is_active?: boolean | null
          is_published?: boolean | null
          slug: string
          start_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Update: {
          cloudinary_public_id?: string | null
          created_at?: string | null
          current_amount?: number
          description?: string
          end_date?: string | null
          featured_image?: string | null
          goal_amount?: number
          id?: string
          is_active?: boolean | null
          is_published?: boolean | null
          slug?: string
          start_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      celebrations: {
        Row: {
          celebrant_name: string
          celebration_type: string
          community_name: string
          created_at: string | null
          day_of_week: string
          id: string
          is_active: boolean | null
          order_index: number | null
          time: string
          updated_at: string | null
        }
        Insert: {
          celebrant_name?: string
          celebration_type?: string
          community_name?: string
          created_at?: string | null
          day_of_week?: string
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          time?: string
          updated_at?: string | null
        }
        Update: {
          celebrant_name?: string
          celebration_type?: string
          community_name?: string
          created_at?: string | null
          day_of_week?: string
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      documentation_procedures: {
        Row: {
          content: string
          created_at: string | null
          description: string
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string
          created_at?: string | null
          description?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          title?: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          description?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      home_sections: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          section_key: string
          section_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          section_key: string
          section_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          section_key?: string
          section_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          page_path: string
          page_title: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          page_path: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      parish_announcements: {
        Row: {
          content: string
          created_at: string | null
          event_date: string | null
          flyer_url: string | null
          id: string
          is_published: boolean | null
          slug: string | null
          title: string
          type: string
          updated_at: string | null
          whatsapp_contact: string | null
        }
        Insert: {
          content?: string
          created_at?: string | null
          event_date?: string | null
          flyer_url?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          whatsapp_contact?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          event_date?: string | null
          flyer_url?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          whatsapp_contact?: string | null
        }
        Relationships: []
      }
      parishes: {
        Row: {
          address: string | null
          cloudinary_public_id: string | null
          confession_hours: string | null
          created_at: string | null
          email: string | null
          founded_year: number | null
          history: string
          id: string
          landline_phone: string | null
          logo_url: string | null
          name: string
          office_hours: string | null
          phone: string | null
          spiritual_direction_hours: string | null
          updated_at: string | null
          whatsapp_phone: string | null
        }
        Insert: {
          address?: string | null
          cloudinary_public_id?: string | null
          confession_hours?: string | null
          created_at?: string | null
          email?: string | null
          founded_year?: number | null
          history?: string
          id?: string
          landline_phone?: string | null
          logo_url?: string | null
          name?: string
          office_hours?: string | null
          phone?: string | null
          spiritual_direction_hours?: string | null
          updated_at?: string | null
          whatsapp_phone?: string | null
        }
        Update: {
          address?: string | null
          cloudinary_public_id?: string | null
          confession_hours?: string | null
          created_at?: string | null
          email?: string | null
          founded_year?: number | null
          history?: string
          id?: string
          landline_phone?: string | null
          logo_url?: string | null
          name?: string
          office_hours?: string | null
          phone?: string | null
          spiritual_direction_hours?: string | null
          updated_at?: string | null
          whatsapp_phone?: string | null
        }
        Relationships: []
      }
      pastorals: {
        Row: {
          contact_phone: string | null
          coordinator: string
          created_at: string | null
          description: string
          id: string
          is_active: boolean | null
          name: string
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          contact_phone?: string | null
          coordinator?: string
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          contact_phone?: string | null
          coordinator?: string
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          beneficiary_city: string | null
          beneficiary_name: string | null
          client_id: string | null
          client_secret: string | null
          created_at: string
          environment: string
          id: string
          is_active: boolean
          pix_key: string | null
          pix_key_type: string | null
          provider: string
          proxy_token: string | null
          proxy_url: string | null
          updated_at: string
          webhook_secret: string | null
        }
        Insert: {
          beneficiary_city?: string | null
          beneficiary_name?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          environment?: string
          id?: string
          is_active?: boolean
          pix_key?: string | null
          pix_key_type?: string | null
          provider?: string
          proxy_token?: string | null
          proxy_url?: string | null
          updated_at?: string
          webhook_secret?: string | null
        }
        Update: {
          beneficiary_city?: string | null
          beneficiary_name?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          environment?: string
          id?: string
          is_active?: boolean
          pix_key?: string | null
          pix_key_type?: string | null
          provider?: string
          proxy_token?: string | null
          proxy_url?: string | null
          updated_at?: string
          webhook_secret?: string | null
        }
        Relationships: []
      }
      photo_albums: {
        Row: {
          cloudinary_public_id: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          order_index: number | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          cloudinary_public_id?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          cloudinary_public_id?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      photos: {
        Row: {
          album_id: string | null
          category: string
          cloudinary_public_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          title: string
        }
        Insert: {
          album_id?: string | null
          category?: string
          cloudinary_public_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          title?: string
        }
        Update: {
          album_id?: string | null
          category?: string
          cloudinary_public_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "photo_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      priests: {
        Row: {
          cloudinary_public_id: string | null
          created_at: string | null
          full_bio: string
          id: string
          is_active: boolean | null
          name: string
          ordination_year: number | null
          parish_since: number | null
          photo_url: string | null
          short_bio: string
          title: string
          updated_at: string | null
          video_description: string | null
          video_thumbnail_url: string | null
          video_url: string | null
        }
        Insert: {
          cloudinary_public_id?: string | null
          created_at?: string | null
          full_bio?: string
          id?: string
          is_active?: boolean | null
          name?: string
          ordination_year?: number | null
          parish_since?: number | null
          photo_url?: string | null
          short_bio?: string
          title?: string
          updated_at?: string | null
          video_description?: string | null
          video_thumbnail_url?: string | null
          video_url?: string | null
        }
        Update: {
          cloudinary_public_id?: string | null
          created_at?: string | null
          full_bio?: string
          id?: string
          is_active?: boolean | null
          name?: string
          ordination_year?: number | null
          parish_since?: number | null
          photo_url?: string | null
          short_bio?: string
          title?: string
          updated_at?: string | null
          video_description?: string | null
          video_thumbnail_url?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      priests_gallery: {
        Row: {
          cloudinary_public_id: string | null
          created_at: string | null
          date_at_parish: string | null
          description: string
          id: string
          is_active: boolean | null
          name: string
          order_index: number | null
          photo_url: string | null
          updated_at: string | null
          video_thumbnail_url: string | null
          video_url: string | null
          was_parish_priest: boolean | null
        }
        Insert: {
          cloudinary_public_id?: string | null
          created_at?: string | null
          date_at_parish?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          photo_url?: string | null
          updated_at?: string | null
          video_thumbnail_url?: string | null
          video_url?: string | null
          was_parish_priest?: boolean | null
        }
        Update: {
          cloudinary_public_id?: string | null
          created_at?: string | null
          date_at_parish?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          photo_url?: string | null
          updated_at?: string | null
          video_thumbnail_url?: string | null
          video_url?: string | null
          was_parish_priest?: boolean | null
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string | null
          days_of_week: Json | null
          description: string
          featured_image: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          slug: string
          time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_of_week?: Json | null
          description?: string
          featured_image?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          slug: string
          time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_of_week?: Json | null
          description?: string
          featured_image?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          slug?: string
          time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      schedules: {
        Row: {
          created_at: string | null
          day_of_week: string
          description: string | null
          id: string
          is_active: boolean | null
          time: string
        }
        Insert: {
          created_at?: string | null
          day_of_week?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          time?: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          time?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          logo_alt: string | null
          logo_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          logo_alt?: string | null
          logo_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          logo_alt?: string | null
          logo_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      slides: {
        Row: {
          button_link: string | null
          button_link_type: string | null
          button_open_new_tab: string | null
          button_text: string | null
          cloudinary_public_id: string | null
          created_at: string | null
          description: string
          id: string
          image_url: string
          is_active: boolean | null
          order_index: number | null
          title: string
        }
        Insert: {
          button_link?: string | null
          button_link_type?: string | null
          button_open_new_tab?: string | null
          button_text?: string | null
          cloudinary_public_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          order_index?: number | null
          title?: string
        }
        Update: {
          button_link?: string | null
          button_link_type?: string | null
          button_open_new_tab?: string | null
          button_text?: string | null
          cloudinary_public_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          order_index?: number | null
          title?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_encrypted: boolean | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          cloudinary_public_id: string | null
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          title: string
          year: number
        }
        Insert: {
          cloudinary_public_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          title?: string
          year?: number
        }
        Update: {
          cloudinary_public_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          title?: string
          year?: number
        }
        Relationships: []
      }
      urgent_popups: {
        Row: {
          auto_close_seconds: number | null
          cloudinary_public_id: string | null
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_text: string | null
          link_url: string | null
          priority: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          auto_close_seconds?: number | null
          cloudinary_public_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_text?: string | null
          link_url?: string | null
          priority?: number | null
          title?: string
          updated_at?: string | null
        }
        Update: {
          auto_close_seconds?: number | null
          cloudinary_public_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_text?: string | null
          link_url?: string | null
          priority?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      video_testimonials: {
        Row: {
          cloudinary_public_id: string | null
          created_at: string | null
          description: string
          id: string
          is_active: boolean | null
          name: string
          order_index: number | null
          thumbnail_url: string | null
          updated_at: string | null
          video_type: string
          video_url: string | null
          youtube_id: string | null
        }
        Insert: {
          cloudinary_public_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          thumbnail_url?: string | null
          updated_at?: string | null
          video_type?: string
          video_url?: string | null
          youtube_id?: string | null
        }
        Update: {
          cloudinary_public_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          thumbnail_url?: string | null
          updated_at?: string | null
          video_type?: string
          video_url?: string | null
          youtube_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      generate_slug: { Args: { title: string }; Returns: string }
      increment_campaign_amount: {
        Args: { campaign_id: string; increment_value: number }
        Returns: undefined
      }
      update_daily_analytics: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "editor"
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
      app_role: ["super_admin", "admin", "editor"],
    },
  },
} as const
