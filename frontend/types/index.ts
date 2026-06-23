// =============================================================================
// Shared TypeScript Types for eBook Store
// =============================================================================

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  category: string;
  slug: string;
  cover_url: string;
  hard_copy_url?: string;
  created_at: string;
  rating?: number;       // average (1.0–5.0), undefined if unrated
  rating_count?: number; // total ratings
}

export interface BookListResponse {
  books: Book[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
}

export interface Order {
  id: string;
  book_id: string;
  buyer_name: string;
  buyer_email: string;
  amount: number;
  payment_status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  cashfree_order_id?: string;
  transaction_id?: string;
  created_at: string;
}

export interface CreateOrderRequest {
  book_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
}

export interface CreateOrderResponse {
  cashfree_order_id: string;
  payment_session_id: string;
  amount: number;
  book_title: string;
}

export interface VerifyPaymentRequest {
  cashfree_order_id: string;
  cashfree_payment_id: string;
  cashfree_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  download_token?: string;
  message: string;
}

export interface AdminOrder extends Order {
  book_title: string;
  buyer_phone: string;
}

export interface SalesStats {
  total_revenue: number;
  total_orders: number;
  successful_orders: number;
  pending_orders: number;
  failed_orders: number;
  total_books: number;
  recent_orders: RecentOrder[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ContactMessageListResponse {
  messages: ContactMessage[];
  total: number;
  page: number;
  limit: number;
}

export interface RecentOrder {
  id: string;
  book_title: string;
  buyer_name: string;
  amount: number;
  created_at: string;
}

export interface AdminOrdersResponse {
  orders: AdminOrder[];
  total: number;
  page: number;
  limit: number;
}

export type Category =
  | "Programming"
  | "Self-Help"
  | "Business"
  | "Science"
  | "Fiction"
  | "Non-Fiction"
  | "Design"
  | "Marketing"
  | "Finance"
  | "Health"
  | "Other";

export const CATEGORIES: Category[] = [
  "Programming",
  "Self-Help",
  "Business",
  "Science",
  "Fiction",
  "Non-Fiction",
  "Design",
  "Marketing",
  "Finance",
  "Health",
  "Other",
];

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface RatingSubmitRequest {
  book_id: string;
  rating: number;
  download_token: string;
}

export interface RatingResponse {
  book_id: string;
  average: number | null;
  count: number;
}
