import type { OrderStatus } from './database'

export interface OrderItem {
  id: string
  product_name: string
  shade_name: string
  shade_hex: string
  image_url: string | null
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Order {
  id: string
  order_number: string
  status: OrderStatus
  customer_name: string
  customer_email: string
  customer_phone?: string
  address: string
  neighborhood: string
  city: string
  department?: string
  notes?: string | null
  subtotal: number
  delivery_fee: number
  total: number
  payment_method?: string
  payment_confirmed_at: string | null
  payment_expires_at?: string | null
  created_at: string
  order_items: OrderItem[]
}

export interface HistoryEntry {
  status: OrderStatus
  note: string | null
  changed_at: string
}

export interface OrderRow {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  status: OrderStatus
  total: number
  item_count: number
  created_at: string
}

export interface RawOrder {
  id: string
  status: OrderStatus
  total: number
  created_at: string
  customer_email: string
  customer_name?: string
  order_number?: string
}

export interface RawItem {
  product_id: string | null
  product_name: string
  shade_id: string | null
  shade_name: string
  shade_hex: string
  quantity: number
  subtotal: number
}

export interface LowStockRow {
  product_id: string
  product_name: string
  min_shade_stock: number
  total_stock: number
}
