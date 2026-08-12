export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type ProductStatus = 'draft' | 'active' | 'inactive'
export type OrderStatus = 'pending_payment' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
export type UserRole = 'customer' | 'admin' | 'superadmin'
export type NotificationType = 'order_confirmation' | 'payment_confirmed' | 'order_shipped' | 'order_delivered'
export type NotificationStatus = 'pending' | 'sent' | 'failed'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string | null; email: string; phone: string | null; role: UserRole; avatar_url: string | null; created_at: string; updated_at: string }
        Insert: { id: string; email: string; full_name?: string | null; phone?: string | null; role?: UserRole; avatar_url?: string | null }
        Update: { full_name?: string | null; phone?: string | null; role?: UserRole; avatar_url?: string | null }
        Relationships: []
      }
      categories: {
        Row: { id: string; name: string; slug: string; description: string | null; image_url: string | null; face_region: string | null; is_active: boolean; sort_order: number; created_at: string }
        Insert: { name: string; slug: string; description?: string | null; image_url?: string | null; face_region?: string | null; is_active?: boolean; sort_order?: number }
        Update: { name?: string; slug?: string; description?: string | null; image_url?: string | null; face_region?: string | null; is_active?: boolean; sort_order?: number }
        Relationships: []
      }
      products: {
        Row: { id: string; category_id: string; name: string; slug: string; description: string | null; price: number; compare_price: number | null; cost_price: number | null; brand: string | null; no_color_variation: boolean; status: ProductStatus; is_featured: boolean; meta_title: string | null; meta_description: string | null; created_at: string; updated_at: string }
        Insert: { category_id: string; name: string; slug: string; price: number; description?: string | null; compare_price?: number | null; cost_price?: number | null; brand?: string | null; no_color_variation?: boolean; status?: ProductStatus; is_featured?: boolean; meta_title?: string | null; meta_description?: string | null }
        Update: { category_id?: string; name?: string; slug?: string; price?: number; description?: string | null; compare_price?: number | null; cost_price?: number | null; brand?: string | null; no_color_variation?: boolean; status?: ProductStatus; is_featured?: boolean; meta_title?: string | null; meta_description?: string | null }
        Relationships: []
      }
      product_images: {
        Row: { id: string; product_id: string; url: string; alt_text: string | null; is_main: boolean; sort_order: number; created_at: string }
        Insert: { product_id: string; url: string; alt_text?: string | null; is_main?: boolean; sort_order?: number }
        Update: { url?: string; alt_text?: string | null; is_main?: boolean; sort_order?: number }
        Relationships: []
      }
      product_shades: {
        Row: { id: string; product_id: string; name: string; hex_color: string; excel_ref: string | null; image_url: string | null; stock: number; is_active: boolean; sort_order: number; created_at: string; updated_at: string }
        Insert: { id?: string; product_id: string; name: string; hex_color: string; excel_ref?: string | null; image_url?: string | null; stock?: number; is_active?: boolean; sort_order?: number }
        Update: { name?: string; hex_color?: string; excel_ref?: string | null; image_url?: string | null; stock?: number; is_active?: boolean; sort_order?: number }
        Relationships: []
      }
      orders: {
        Row: { id: string; user_id: string | null; order_number: string; status: OrderStatus; customer_name: string; customer_email: string; customer_phone: string; address: string; neighborhood: string; city: string; department: string; notes: string | null; subtotal: number; delivery_fee: number; total: number; payment_method: string; payment_confirmed_at: string | null; payment_confirmed_by: string | null; created_at: string; updated_at: string }
        Insert: { user_id?: string | null; order_number: string; status?: OrderStatus; customer_name: string; customer_email: string; customer_phone: string; address: string; neighborhood: string; city: string; department: string; payment_method: string; subtotal: number; delivery_fee: number; total: number; notes?: string | null; payment_confirmed_at?: string | null; payment_confirmed_by?: string | null }
        Update: { status?: OrderStatus; payment_confirmed_at?: string | null; payment_confirmed_by?: string | null }
        Relationships: []
      }
      order_items: {
        Row: { id: string; order_id: string; product_id: string | null; shade_id: string | null; product_name: string; shade_name: string; shade_hex: string; image_url: string | null; quantity: number; unit_price: number; subtotal: number; created_at: string }
        Insert: { order_id: string; product_id?: string | null; shade_id?: string | null; product_name: string; shade_name: string; shade_hex: string; image_url?: string | null; quantity: number; unit_price: number; subtotal: number }
        Update: Record<string, never>
        Relationships: []
      }
      store_config: {
        Row: { key: string; value: string; description: string | null; updated_at: string }
        Insert: { key: string; value: string; description?: string | null }
        Update: { value?: string; description?: string | null }
        Relationships: []
      }
      email_notifications: {
        Row: { id: string; order_id: string; type: NotificationType; recipient_email: string; status: NotificationStatus; created_at: string; sent_at: string | null }
        Insert: { order_id: string; type: NotificationType; recipient_email: string; status?: NotificationStatus }
        Update: { status?: NotificationStatus; sent_at?: string | null }
        Relationships: []
      }
      order_status_history: {
        Row: { id: string; order_id: string; status: OrderStatus; note: string | null; changed_at: string }
        Insert: { order_id: string; status: OrderStatus; note?: string | null }
        Update: Record<string, never>
        Relationships: []
      }
      admin_activity_log: {
        Row: { id: string; actor_id: string | null; actor_email: string; action: string; entity_type: string; entity_id: string | null; entity_label: string | null; details: Json | null; created_at: string }
        Insert: { actor_id?: string | null; actor_email: string; action: string; entity_type: string; entity_id?: string | null; entity_label?: string | null; details?: Json | null }
        Update: Record<string, never>
        Relationships: []
      }
    }
    Views: {
      v_inventory_summary: {
        Row: { product_id: string; product_name: string; category_name: string | null; status: ProductStatus; total_shades: number; total_stock: number; out_of_stock_shades: number; low_stock_shades: number; min_shade_stock: number }
        Relationships: []
      }
      v_orders_detail: {
        Row: { id: string; order_number: string; status: OrderStatus; customer_name: string; customer_email: string; customer_phone: string; full_address: string; subtotal: number; delivery_fee: number; total: number; payment_method: string; payment_confirmed_at: string | null; created_at: string; notes: string | null; item_count: number; total_units: number }
        Relationships: []
      }
    }
    Functions: {
      generate_order_number: { Args: Record<string, never>; Returns: string }
      is_admin: { Args: Record<string, never>; Returns: boolean }
    }
  }
}
