// src/types/index.ts
// TypeScript interfaces mirroring the FastAPI backend schemas

export interface User {
  id: number;
  email: string;
  display_name: string;
  role: 'campus_user' | 'admin' | 'analyst';
  is_active?: boolean;
}

export interface AuthSessionResponse {
  user: User;
  message: string;
}

export interface StatusHistoryItem {
  id?: number;
  old_status?: string | null;
  new_status?: string;
  status?: string;
  public_remark?: string | null;
  internal_note?: string | null;
  timestamp?: string;
  created_at?: string;
}

export interface Complaint {
  id: number;
  complaint_id: string;
  title?: string;
  description: string;
  category: string;
  location: string;
  severity: string;
  status: string;
  is_anonymous: boolean;
  source?: string;
  user_id?: number | null;
  user_display_name?: string | null;
  submitted_at: string;
  resolved_at?: string | null;
  predicted_resolution_hours?: number | null;
  prediction_model_version?: string | null;
  priority_flag?: boolean;
  tracking_token?: string;
  status_history?: StatusHistoryItem[];
}

export interface TrackingInfo {
  complaint: {
    id: number;
    complaint_id: string;
    title?: string;
    description: string;
    category: string;
    location: string;
    severity: string;
    status: string;
    submitted_at: string;
    resolved_at?: string | null;
    resolution_estimate?: number | null;
    predicted_resolution_hours?: number | null;
    tracking_token?: string;
  };
  public_notes: string[];
  status_history: Array<{
    status: string;
    timestamp: string | null;
    note?: string | null;
  }>;
}

export interface AnalyticsSummary {
  total_complaints: number;
  open: number;
  resolved: number;
  avg_resolution_time_days: number;
  top_categories: Array<{ category: string; count: number }>;
  top_locations: Array<{ location: string; count: number }>;
}
