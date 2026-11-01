// src/types/index.ts
// TypeScript interfaces that mirror the FastAPI backend schemas.
// These are used throughout the React frontend for type‑safe API calls.

export interface User {
  id: number;
  email: string;
  display_name: string;
  role: "campus_user" | "admin" | "analyst";
}

export interface AuthResponse {
  access_token: string; // JWT token returned by /auth/login (if used)
  token_type: string; // typically "bearer"
  user: User;
}

export interface Complaint {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  severity: number;
  submitted_at: string; // ISO datetime string
  status: string; // e.g., "open", "in_progress", "resolved"
  resolution_estimate?: number; // days, optional
  tracking_token: string; // secret token for public tracking
  reporter_id?: number; // null for anonymous
}

export interface ComplaintCreate {
  title: string;
  description: string;
  category: string;
  location: string;
  severity: number;
  // No reporter_id – backend determines from auth or anonymity.
}

export interface TrackingInfo {
  complaint: Complaint;
  public_notes: string[];
  status_history: Array<{ status: string; timestamp: string; note?: string }>;
}

export interface AnalyticsSummary {
  total_complaints: number;
  open: number;
  resolved: number;
  avg_resolution_time_days: number;
  top_categories: Array<{ category: string; count: number }>;
  top_locations: Array<{ location: string; count: number }>;
}
