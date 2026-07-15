/* ==============================
   Types — mirrors backend DTOs exactly
   ============================== */

// -------- Enums --------

export type Role = 'STUDENT' | 'AUTHOR' | 'ADMIN';

export type Category = 'TECH' | 'COMMUNICATION' | 'PSYCHOLOGY' | 'LANGUAGE';

export type SortBy = 'createdAt' | 'updatedAt' | 'price' | 'title';

export type Direction = 'ASC' | 'DESC';

// -------- Auth DTOs --------

export interface SignupRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

// -------- Course DTOs --------

/** Mirrors CourseResponseDto.java */
export interface CourseResponseDto {
  id: number;
  name: string;
  description: string;
  amount: number;
  category: Category;
  authorName: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  videoUrl: string | null;
}

/** Mirrors Spring Page<T> response shape */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-indexed)
  size: number;
}

/** Fields sent in the "data" part of the multipart form (mirrors CourseDto.java) */
export interface CourseFormData {
  name: string;
  description: string;
  amount: number;
  category: Category;
  published: boolean;
  author: string;
  videoUrl?: string;
}

// -------- Payment DTOs --------

/** Mirrors CourseAmountResponseDto.java */
export interface CourseAmountResponseDto {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  courseName: string;
}

/** Mirrors VerifyPaymentRequestDto.java */
export interface VerifyPaymentRequest {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  signature: string;
  courseId: number;
}

// -------- Auth Context --------

export interface AuthUser {
  name: string;
  role: Role;
}

// -------- Query Params --------

export interface CourseQueryParams {
  page?: number;
  size?: number;
  sortBy?: SortBy;
  direction?: Direction;
  category?: Category;
  search?: string;
}

// -------- Chat DTOs --------

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number; // local timestamp for rendering
}

export interface ChatResponse {
  message: string;
  conversationId: string;
}

