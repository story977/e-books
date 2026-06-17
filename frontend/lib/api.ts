// =============================================================================
// API Client — typed fetch wrapper for the FastAPI backend
// =============================================================================

import type {
  Book,
  BookListResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  SalesStats,
  AdminOrdersResponse,
} from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 
  (typeof window === "undefined" ? "http://127.0.0.1:8000" : "http://localhost:8000");

class APIError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new APIError(res.status, error.detail || "Request failed");
  }

  return res.json() as Promise<T>;
}

function authHeader(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

// =============================================================================
// Book APIs
// =============================================================================

export async function fetchBooks(params: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: string;
  order?: string;
} = {}): Promise<BookListResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.category) query.set("category", params.category);
  if (params.search) query.set("search", params.search);
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);

  return request<BookListResponse>(`/books?${query.toString()}`);
}

export async function fetchBook(slugOrId: string): Promise<Book> {
  return request<Book>(`/books/${slugOrId}`);
}

export async function createBook(formData: FormData, token: string): Promise<Book> {
  const res = await fetch(`${BASE_URL}/books`, {
    method: "POST",
    headers: authHeader(token),
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to create book" }));
    throw new APIError(res.status, error.detail);
  }
  return res.json();
}

export async function updateBook(
  id: string,
  formData: FormData,
  token: string
): Promise<Book> {
  const res = await fetch(`${BASE_URL}/books/${id}`, {
    method: "PUT",
    headers: authHeader(token),
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to update book" }));
    throw new APIError(res.status, error.detail);
  }
  return res.json();
}

export async function deleteBook(id: string, token: string): Promise<void> {
  await request<void>(`/books/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
}

// =============================================================================
// Payment APIs
// =============================================================================

export async function createOrder(
  data: CreateOrderRequest
): Promise<CreateOrderResponse> {
  return request<CreateOrderResponse>("/payment/create-order", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verifyPayment(
  data: VerifyPaymentRequest
): Promise<VerifyPaymentResponse> {
  return request<VerifyPaymentResponse>("/payment/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// =============================================================================
// Admin APIs
// =============================================================================

export async function adminLogin(
  username: string,
  password: string
): Promise<{ access_token: string; token_type: string; expires_in: number }> {
  return request("/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function fetchAdminOrders(
  token: string,
  params: { page?: number; limit?: number; status?: string } = {}
): Promise<AdminOrdersResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);

  return request<AdminOrdersResponse>(`/admin/orders?${query.toString()}`, {
    headers: authHeader(token),
  });
}

export async function fetchSalesStats(token: string): Promise<SalesStats> {
  return request<SalesStats>("/admin/sales", {
    headers: authHeader(token),
  });
}

// Contact
export async function submitContactForm(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>("/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function fetchAdminMessages(token: string, page = 1, limit = 20): Promise<any> {
  return request<any>(`/contact?page=${page}&limit=${limit}`, {
    headers: authHeader(token),
  });
}

export async function markMessageRead(messageId: string, token: string): Promise<any> {
  return request<any>(`/contact/${messageId}/read`, {
    method: "PUT",
    headers: authHeader(token),
  });
}

export { APIError };
