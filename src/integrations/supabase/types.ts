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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string | null
          id: string
          message: string | null
          metadata: Json | null
          order_id: string | null
          severity: string
          title: string
          type: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          order_id?: string | null
          severity?: string
          title: string
          type: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          order_id?: string | null
          severity?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_alerts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "driver_live_tracking_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "admin_alerts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_audit_logs: {
        Row: {
          actions: Json
          admin_user_id: string
          applied_at: string | null
          created_at: string
          error_message: string | null
          id: string
          prompt: string
          result_summary: string | null
          status: string
          undo_data: Json | null
          undone_at: string | null
        }
        Insert: {
          actions?: Json
          admin_user_id: string
          applied_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          prompt: string
          result_summary?: string | null
          status?: string
          undo_data?: Json | null
          undone_at?: string | null
        }
        Update: {
          actions?: Json
          admin_user_id?: string
          applied_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          prompt?: string
          result_summary?: string | null
          status?: string
          undo_data?: Json | null
          undone_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_deleted: boolean
          name_ar: string
          name_en: string
          slug: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_deleted?: boolean
          name_ar: string
          name_en: string
          slug?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_deleted?: boolean
          name_ar?: string
          name_en?: string
          slug?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      customer_feedback: {
        Row: {
          admin_notes: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          feedback_type: string
          id: string
          order_id: string | null
          order_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          feedback_type: string
          id?: string
          order_id?: string | null
          order_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          feedback_type?: string
          id?: string
          order_id?: string | null
          order_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_feedback_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "driver_live_tracking_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "customer_feedback_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_order_preferences: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          last_ordered_at: string
          last_voice_note_duration: number | null
          last_voice_note_path: string | null
          order_count: number
          preferred_notes: string | null
          preferred_quantity: number
          preferred_unit: string
          product_id: string
          product_name: string
          product_name_en: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          last_ordered_at?: string
          last_voice_note_duration?: number | null
          last_voice_note_path?: string | null
          order_count?: number
          preferred_notes?: string | null
          preferred_quantity?: number
          preferred_unit?: string
          product_id: string
          product_name: string
          product_name_en?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          last_ordered_at?: string
          last_voice_note_duration?: number | null
          last_voice_note_path?: string | null
          order_count?: number
          preferred_notes?: string | null
          preferred_quantity?: number
          preferred_unit?: string
          product_id?: string
          product_name?: string
          product_name_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          created_at: string
          delivery_fee: number
          estimated_minutes_max: number
          estimated_minutes_min: number
          free_delivery_threshold: number
          id: string
          is_active: boolean
          name: string
          name_ar: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_fee?: number
          estimated_minutes_max?: number
          estimated_minutes_min?: number
          free_delivery_threshold?: number
          id?: string
          is_active?: boolean
          name: string
          name_ar: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_fee?: number
          estimated_minutes_max?: number
          estimated_minutes_min?: number
          free_delivery_threshold?: number
          id?: string
          is_active?: boolean
          name?: string
          name_ar?: string
          updated_at?: string
        }
        Relationships: []
      }
      driver_locations: {
        Row: {
          accuracy: number | null
          created_at: string | null
          driver_id: string
          heading: number | null
          id: string
          latitude: number
          longitude: number
          speed: number | null
        }
        Insert: {
          accuracy?: number | null
          created_at?: string | null
          driver_id: string
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          speed?: number | null
        }
        Update: {
          accuracy?: number | null
          created_at?: string | null
          driver_id?: string
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_locations_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_orders: {
        Row: {
          accepted_at: string | null
          assigned_at: string | null
          assigned_by: string | null
          completed_at: string | null
          driver_id: string
          id: string
          notes: string | null
          order_id: string
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          completed_at?: string | null
          driver_id: string
          id?: string
          notes?: string | null
          order_id: string
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          completed_at?: string | null
          driver_id?: string
          id?: string
          notes?: string | null
          order_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "driver_live_tracking_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "driver_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          availability:
            | Database["public"]["Enums"]["driver_availability"]
            | null
          created_at: string | null
          current_order_id: string | null
          id: string
          name: string
          phone: string
          updated_at: string | null
          user_id: string | null
          vehicle_number: string | null
          vehicle_type: string | null
        }
        Insert: {
          availability?:
            | Database["public"]["Enums"]["driver_availability"]
            | null
          created_at?: string | null
          current_order_id?: string | null
          id?: string
          name: string
          phone: string
          updated_at?: string | null
          user_id?: string | null
          vehicle_number?: string | null
          vehicle_type?: string | null
        }
        Update: {
          availability?:
            | Database["public"]["Enums"]["driver_availability"]
            | null
          created_at?: string | null
          current_order_id?: string | null
          id?: string
          name?: string
          phone?: string
          updated_at?: string | null
          user_id?: string | null
          vehicle_number?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_drivers_current_order"
            columns: ["current_order_id"]
            isOneToOne: false
            referencedRelation: "driver_live_tracking_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "fk_drivers_current_order"
            columns: ["current_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          menu_id: string
          sort_order: number
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          menu_id: string
          sort_order?: number
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          menu_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_categories_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_products: {
        Row: {
          created_at: string
          id: string
          menu_id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          menu_id: string
          product_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          menu_id?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_products_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          auto_sync: boolean
          created_at: string
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
          show_on_desktop: boolean
          show_on_mobile: boolean
          slug: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          auto_sync?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          name_ar: string
          name_en: string
          show_on_desktop?: boolean
          show_on_mobile?: boolean
          slug?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          auto_sync?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          show_on_desktop?: boolean
          show_on_mobile?: boolean
          slug?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          id: string
          order_cancelled: boolean
          order_confirmed: boolean
          order_delivered: boolean
          order_out_for_delivery: boolean
          order_preparing: boolean
          order_ready: boolean
          promotions: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_cancelled?: boolean
          order_confirmed?: boolean
          order_delivered?: boolean
          order_out_for_delivery?: boolean
          order_preparing?: boolean
          order_ready?: boolean
          promotions?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_cancelled?: boolean
          order_confirmed?: boolean
          order_delivered?: boolean
          order_out_for_delivery?: boolean
          order_preparing?: boolean
          order_ready?: boolean
          promotions?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          channel: string | null
          content: string | null
          created_at: string | null
          id: string
          order_id: string | null
          sent: boolean | null
          sent_at: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          channel?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          sent?: boolean | null
          sent_at?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          channel?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          sent?: boolean | null
          sent_at?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "driver_live_tracking_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_confirmations: {
        Row: {
          confirmation_status: string
          created_at: string
          created_by: string | null
          customer_response: string | null
          id: string
          order_id: string
          photo_note: string | null
          photo_path: string
          responded_at: string | null
        }
        Insert: {
          confirmation_status?: string
          created_at?: string
          created_by?: string | null
          customer_response?: string | null
          id?: string
          order_id: string
          photo_note?: string | null
          photo_path: string
          responded_at?: string | null
        }
        Update: {
          confirmation_status?: string
          created_at?: string
          created_by?: string | null
          customer_response?: string | null
          id?: string
          order_id?: string
          photo_note?: string | null
          photo_path?: string
          responded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_confirmations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "driver_live_tracking_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_confirmations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          notes_audio_url: string | null
          order_id: string
          price_per_unit: number
          product_id: string
          product_name: string
          product_name_en: string | null
          product_uuid: string | null
          quantity: number
          subtotal: number
          unit: string
          voice_note_duration: number | null
          voice_note_path: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          notes_audio_url?: string | null
          order_id: string
          price_per_unit?: number
          product_id: string
          product_name: string
          product_name_en?: string | null
          product_uuid?: string | null
          quantity?: number
          subtotal?: number
          unit?: string
          voice_note_duration?: number | null
          voice_note_path?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          notes_audio_url?: string | null
          order_id?: string
          price_per_unit?: number
          product_id?: string
          product_name?: string
          product_name_en?: string | null
          product_uuid?: string | null
          quantity?: number
          subtotal?: number
          unit?: string
          voice_note_duration?: number | null
          voice_note_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "driver_live_tracking_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_uuid_fkey"
            columns: ["product_uuid"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_messages: {
        Row: {
          content: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          is_read: boolean | null
          message_type: string
          order_id: string
          product_id: string | null
          sender_type: string
          storage_path: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_read?: boolean | null
          message_type: string
          order_id: string
          product_id?: string | null
          sender_type: string
          storage_path?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_read?: boolean | null
          message_type?: string
          order_id?: string
          product_id?: string | null
          sender_type?: string
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "driver_live_tracking_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_updates: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_updates_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "driver_live_tracking_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_updates_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_voice_notes: {
        Row: {
          created_at: string
          duration_seconds: number
          id: string
          order_id: string
          product_id: string | null
          storage_path: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number
          id?: string
          order_id: string
          product_id?: string | null
          storage_path: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          id?: string
          order_id?: string
          product_id?: string | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_voice_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "driver_live_tracking_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_voice_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          branch_name: string | null
          created_at: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string
          delivered_at: string | null
          delivery_address: string
          delivery_city: string | null
          delivery_fee: number | null
          delivery_notes: string | null
          discount: number | null
          driver_id: string | null
          estimated_arrival: string | null
          id: string
          idempotency_key: string | null
          iiko_order_id: string | null
          iiko_order_number: string | null
          iiko_sync_attempts: number | null
          iiko_sync_error: string | null
          iiko_sync_last_attempt: string | null
          iiko_synced: boolean | null
          items: Json
          order_number: string
          order_type: string | null
          scheduled_date: string | null
          scheduled_time_slot: string | null
          source: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          total_weight: number | null
          updated_at: string | null
        }
        Insert: {
          branch_name?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          delivered_at?: string | null
          delivery_address: string
          delivery_city?: string | null
          delivery_fee?: number | null
          delivery_notes?: string | null
          discount?: number | null
          driver_id?: string | null
          estimated_arrival?: string | null
          id?: string
          idempotency_key?: string | null
          iiko_order_id?: string | null
          iiko_order_number?: string | null
          iiko_sync_attempts?: number | null
          iiko_sync_error?: string | null
          iiko_sync_last_attempt?: string | null
          iiko_synced?: boolean | null
          items?: Json
          order_number: string
          order_type?: string | null
          scheduled_date?: string | null
          scheduled_time_slot?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          total?: number
          total_weight?: number | null
          updated_at?: string | null
        }
        Update: {
          branch_name?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          delivered_at?: string | null
          delivery_address?: string
          delivery_city?: string | null
          delivery_fee?: number | null
          delivery_notes?: string | null
          discount?: number | null
          driver_id?: string | null
          estimated_arrival?: string | null
          id?: string
          idempotency_key?: string | null
          iiko_order_id?: string | null
          iiko_order_number?: string | null
          iiko_sync_attempts?: number | null
          iiko_sync_error?: string | null
          iiko_sync_last_attempt?: string | null
          iiko_synced?: boolean | null
          items?: Json
          order_number?: string
          order_type?: string | null
          scheduled_date?: string | null
          scheduled_time_slot?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          total?: number
          total_weight?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          is_primary: boolean
          product_id: string
          sort_order: number
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id: string
          sort_order?: number
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allow_add_to_cart: boolean | null
          category: string | null
          compare_at_price: number | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          iiko_id: string | null
          image_url: string | null
          is_active: boolean | null
          is_box: boolean | null
          name_ar: string
          name_en: string | null
          price: number
          price_per: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          allow_add_to_cart?: boolean | null
          category?: string | null
          compare_at_price?: number | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          iiko_id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_box?: boolean | null
          name_ar: string
          name_en?: string | null
          price?: number
          price_per?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          allow_add_to_cart?: boolean | null
          category?: string | null
          compare_at_price?: number | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          iiko_id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_box?: boolean | null
          name_ar?: string
          name_en?: string | null
          price?: number
          price_per?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          platform: string
          token: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform?: string
          token: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitor_sessions: {
        Row: {
          created_at: string
          current_page: string
          id: string
          is_mobile: boolean | null
          last_seen: string
          page_title: string | null
          referrer: string | null
          session_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          current_page?: string
          id?: string
          is_mobile?: boolean | null
          last_seen?: string
          page_title?: string | null
          referrer?: string | null
          session_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          current_page?: string
          id?: string
          is_mobile?: boolean | null
          last_seen?: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      driver_live_tracking_view: {
        Row: {
          driver_lat: number | null
          driver_lng: number | null
          heading: number | null
          location_updated_at: string | null
          order_id: string | null
          order_number: string | null
          speed: number | null
          status: Database["public"]["Enums"]["order_status"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      attach_products_to_menu: {
        Args: { p_menu_id: string; p_product_ids: string[] }
        Returns: Json
      }
      get_driver_id: { Args: never; Returns: string }
      get_driver_live_tracking: {
        Args: never
        Returns: {
          driver_lat: number
          driver_lng: number
          heading: number
          location_updated_at: string
          order_id: string
          order_number: string
          speed: number
          status: Database["public"]["Enums"]["order_status"]
        }[]
      }
      get_order_tracking: {
        Args: { p_order_number: string }
        Returns: {
          driver_lat: number
          driver_lng: number
          heading: number
          location_updated_at: string
          order_id: string
          order_number: string
          speed: number
          status: Database["public"]["Enums"]["order_status"]
        }[]
      }
      get_user_auth_role: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_driver: { Args: never; Returns: boolean }
      remove_product_from_menu: {
        Args: { p_menu_id: string; p_product_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "driver"
        | "customer"
        | "owner"
        | "branch_manager"
        | "kitchen_staff"
        | "dispatcher"
      driver_availability: "available" | "on_delivery" | "offline"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "ready"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
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
      app_role: [
        "admin",
        "driver",
        "customer",
        "owner",
        "branch_manager",
        "kitchen_staff",
        "dispatcher",
      ],
      driver_availability: ["available", "on_delivery", "offline"],
      order_status: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
