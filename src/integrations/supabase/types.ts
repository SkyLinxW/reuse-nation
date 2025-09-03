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
      cart_items: {
        Row: {
          created_at: string
          id: string
          quantity: number
          user_id: string
          waste_item_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          quantity?: number
          user_id: string
          waste_item_id: string
        }
        Update: {
          created_at?: string
          id?: string
          quantity?: number
          user_id?: string
          waste_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_waste_item_id_fkey"
            columns: ["waste_item_id"]
            isOneToOne: false
            referencedRelation: "waste_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cart_items_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_cart_items_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_cart_items_waste_item_id"
            columns: ["waste_item_id"]
            isOneToOne: false
            referencedRelation: "waste_items"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_conversations_user1_id"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_conversations_user1_id"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_conversations_user2_id"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_conversations_user2_id"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      eco_impact: {
        Row: {
          category_impact: Json
          co2_saved: number
          id: string
          total_waste_reused: number
          transactions_count: number
          updated_at: string
        }
        Insert: {
          category_impact?: Json
          co2_saved?: number
          id?: string
          total_waste_reused?: number
          transactions_count?: number
          updated_at?: string
        }
        Update: {
          category_impact?: Json
          co2_saved?: number
          id?: string
          total_waste_reused?: number
          transactions_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          user_id: string
          waste_item_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          waste_item_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          waste_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_waste_item_id_fkey"
            columns: ["waste_item_id"]
            isOneToOne: false
            referencedRelation: "waste_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_favorites_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_favorites_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_favorites_waste_item_id"
            columns: ["waste_item_id"]
            isOneToOne: false
            referencedRelation: "waste_items"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_messages_conversation_id"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_messages_sender_id"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_messages_sender_id"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_notifications_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_notifications_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewed_user_id: string
          reviewer_id: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewed_user_id: string
          reviewer_id: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewed_user_id?: string
          reviewer_id?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_reviews_reviewed_user_id"
            columns: ["reviewed_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_reviews_reviewed_user_id"
            columns: ["reviewed_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_reviews_reviewer_id"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_reviews_reviewer_id"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_reviews_transaction_id"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          created_at: string
          id: string
          search_term: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          search_term: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          search_term?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_search_history_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_search_history_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      transactions: {
        Row: {
          buyer_id: string
          completed_at: string | null
          created_at: string
          delivery_address: string | null
          delivery_method: string
          id: string
          payment_method: string
          quantity: number
          seller_id: string
          status: string
          total_price: number
          waste_item_id: string
        }
        Insert: {
          buyer_id: string
          completed_at?: string | null
          created_at?: string
          delivery_address?: string | null
          delivery_method: string
          id?: string
          payment_method: string
          quantity: number
          seller_id: string
          status?: string
          total_price: number
          waste_item_id: string
        }
        Update: {
          buyer_id?: string
          completed_at?: string | null
          created_at?: string
          delivery_address?: string | null
          delivery_method?: string
          id?: string
          payment_method?: string
          quantity?: number
          seller_id?: string
          status?: string
          total_price?: number
          waste_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_transactions_buyer_id"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_transactions_buyer_id"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_transactions_seller_id"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_transactions_seller_id"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_transactions_waste_item_id"
            columns: ["waste_item_id"]
            isOneToOne: false
            referencedRelation: "waste_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_waste_item_id_fkey"
            columns: ["waste_item_id"]
            isOneToOne: false
            referencedRelation: "waste_items"
            referencedColumns: ["id"]
          },
        ]
      }
      waste_items: {
        Row: {
          availability: boolean
          category: string
          condition: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          location: string
          price: number
          quantity: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: boolean
          category: string
          condition: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          location: string
          price: number
          quantity: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: boolean
          category?: string
          condition?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          location?: string
          price?: number
          quantity?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_waste_items_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_waste_items_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          name: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          name?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
    Enums: {},
  },
} as const
