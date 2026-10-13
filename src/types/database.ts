// Supabase MCP generate_typescript_types 로 생성한 타입 (스키마 변경 시 다시 생성)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type OrderRow = {
  address1: string
  address2: string | null
  created_at: string
  id: string
  items_total: number
  memo: string | null
  order_name: string
  order_no: string
  paid_at: string | null
  payment_key: string | null
  payment_method: string | null
  phone: string
  recipient: string
  shipping_fee: number
  status: string
  total: number
  user_id: string
  zipcode: string | null
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string
          product_id: number
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          product_id: number
          quantity: number
          user_id: string
        }
        Update: {
          created_at?: string
          product_id?: number
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          description: string | null
          id: number
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: number
          image_url: string | null
          order_id: string
          price: number
          product_id: number | null
          product_name: string
          quantity: number
        }
        Insert: {
          id?: number
          image_url?: string | null
          order_id: string
          price: number
          product_id?: number | null
          product_name: string
          quantity: number
        }
        Update: {
          id?: number
          image_url?: string | null
          order_id?: string
          price?: number
          product_id?: number | null
          product_name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: OrderRow
        Insert: Partial<OrderRow> & {
          address1: string
          items_total: number
          order_name: string
          order_no: string
          phone: string
          recipient: string
          shipping_fee: number
          total: number
          user_id: string
        }
        Update: Partial<OrderRow>
        Relationships: []
      }
      products: {
        Row: {
          brand: string | null
          category_id: number
          created_at: string
          description: string | null
          id: number
          image_credit: string | null
          image_credit_url: string | null
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          name: string
          price: number
          sales_count: number
          slug: string
          source_url: string | null
          specs: Json
          stock: number
          summary: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category_id: number
          created_at?: string
          description?: string | null
          id?: number
          image_credit?: string | null
          image_credit_url?: string | null
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name: string
          price: number
          sales_count?: number
          slug: string
          source_url?: string | null
          specs?: Json
          stock?: number
          summary?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category_id?: number
          created_at?: string
          description?: string | null
          id?: number
          image_credit?: string | null
          image_credit_url?: string | null
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name?: string
          price?: number
          sales_count?: number
          slug?: string
          source_url?: string | null
          specs?: Json
          stock?: number
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address1: string | null
          address2: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          role: string
          zipcode: string | null
        }
        Insert: {
          address1?: string | null
          address2?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          role?: string
          zipcode?: string | null
        }
        Update: {
          address1?: string | null
          address2?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          role?: string
          zipcode?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: number
          product_id: number
          rating: number
          user_id: string
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          id?: number
          product_id: number
          rating: number
          user_id: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: number
          product_id?: number
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_order_payment: {
        Args: { p_method: string; p_order_id: string; p_payment_key: string }
        Returns: OrderRow
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_order: {
        Args: {
          p_address1: string
          p_address2: string
          p_items: Json
          p_memo: string
          p_phone: string
          p_recipient: string
          p_zipcode: string
        }
        Returns: OrderRow
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"]

export type Product = Tables<"products">
export type Category = Tables<"categories">
export type Order = Tables<"orders">
export type OrderItem = Tables<"order_items">
export type Review = Tables<"reviews">
export type Profile = Tables<"profiles">
