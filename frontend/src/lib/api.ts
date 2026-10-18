const DEFAULT_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://proofing-harmless-mulled.ngrok-free.dev/api";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // 1. Check query parameter ?api=...
    const urlParams = new URLSearchParams(window.location.search);
    const queryApi = urlParams.get("api");
    if (queryApi) {
      const clean = queryApi.replace(/\/+$/, "");
      const full = clean.endsWith("/api") ? clean : `${clean}/api`;
      localStorage.setItem("custom_api_url", full);
      return full;
    }
    // 2. Check localStorage (purge invalid, mixed-content, or obsolete urls)
    const saved = localStorage.getItem("custom_api_url");
    if (saved) {
      const isMixedContent =
        window.location.protocol === "https:" && saved.startsWith("http://");
      const isObsoleteTunnel =
        saved.includes("trycloudflare.com") ||
        (saved.includes("ngrok-free.dev") && !saved.includes("proofing-harmless-mulled"));
      if (isMixedContent || isObsoleteTunnel) {
        localStorage.removeItem("custom_api_url");
      } else {
        return saved;
      }
    }
    // 3. Localhost fallback
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:8000/api";
    }
  }
  return DEFAULT_API_URL;
}

export function setCustomApiUrl(url: string) {
  if (typeof window !== "undefined") {
    const clean = url.trim().replace(/\/+$/, "");
    const full = clean.endsWith("/api") ? clean : `${clean}/api`;
    localStorage.setItem("custom_api_url", full);
  }
}

// ── Token helpers ──────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function setToken(token: string) {
  localStorage.setItem("auth_token", token);
}

export function clearToken() {
  localStorage.removeItem("auth_token");
}

// ── Types ──────────────────────────────────────────────────
export interface Scholarship {
  id: number;
  title: string;
  university: number;
  university_name: string;
  university_city?: string | null;
  university_country?: string | null;
  type: string;
  level: string;
  amount: string;
  currency: string;
  duration: string;
  application_deadline: string;
  application_link?: string | null;
  total_seats?: number | null;
  seats_filled?: number | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface ScholarshipDetail {
  id: number;
  title: string;
  university_name?: string;
  university_city?: string;
  university_country?: string;
  description: string;
  type: string;
  level: string;
  amount: string;
  stipend_amount?: number | null;
  currency: string;
  duration: string;
  tuition_info?: string | null;
  total_seats?: number | null;
  seats_filled?: number | null;
  seats_available?: number | null;
  application_deadline: string;
  start_date: string;
  end_date: string;
  eligibility_criteria: string;
  required_education_level: string;
  minimum_gpa: number;
  required_fields_of_study: string;
  application_fee: string;
  application_link: string;
  required_documents: string[];
  application_instructions: string;
  contact_email: string;
  contact_phone: string;
  language: string;
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  days_until_deadline: number;
  created_at: string;
  university: {
    id: number;
    name: string;
    logo: string;
    country: string;
    city: string;
    is_verified: boolean;
  };
}

export interface University {
  id: number;
  name: string;
  logo: string;
  country: string;
  city: string;
  address?: string | null;
  founding_year?: number | null;
  motto?: string | null;
  tagline?: string | null;
  description?: string | null;
  about?: string | null;
  website?: string | null;
  is_verified: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StudentProfile {
  id: number;
  phone?: string | null;
  date_of_birth?: string | null;
  country?: string | null;
  city?: string | null;
  education_level?: string | null;
  field_of_study?: string | null;
  gpa?: string | number | null;
  is_premium: boolean;
  payment_date?: string | null;
  payment_id?: string | null;
  saved_scholarships?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  student_profile?: StudentProfile | null;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// ── API fetcher ────────────────────────────────────────────
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${getApiBaseUrl()}${endpoint}`;
    const token = getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers["Authorization"] = `Token ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data: any = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => "");
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      let errorMsg = "An error occurred";

      if (data && typeof data === "object") {
        if (data.detail) {
          errorMsg = data.detail;
        } else if (data.error) {
          errorMsg = data.error;
        } else {
          const messages: string[] = [];
          for (const [field, errors] of Object.entries(data)) {
            if (Array.isArray(errors)) {
              messages.push(`${field}: ${errors.join(", ")}`);
            } else if (typeof errors === "string") {
              messages.push(`${field}: ${errors}`);
            }
          }
          if (messages.length > 0) {
            errorMsg = messages.join(" | ");
          }
        }
      }

      return { error: errorMsg, status: response.status };
    }

    return { data, status: response.status };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
      status: 0,
    };
  }
}

export async function uploadApi<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  try {
    const clean = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${getApiBaseUrl()}${clean}`;
    const token = getToken();
    const headers: Record<string, string> = {
      "ngrok-skip-browser-warning": "true",
    };
    if (token) {
      headers["Authorization"] = `Token ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    let data: any = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => "");
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      let errorMsg = "Upload failed";
      if (data && typeof data === "object") {
        if (data.detail) errorMsg = data.detail;
        else if (data.error) errorMsg = data.error;
        else {
          const messages: string[] = [];
          for (const [field, errors] of Object.entries(data)) {
            if (Array.isArray(errors)) {
              messages.push(`${field}: ${errors.join(", ")}`);
            } else if (typeof errors === "string") {
              messages.push(`${field}: ${errors}`);
            }
          }
          if (messages.length > 0) errorMsg = messages.join(" | ");
        }
      } else if (typeof data === "string" && data) {
        errorMsg = data;
      }
      return { error: errorMsg, status: response.status };
    }

    return { data, status: response.status };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
      status: 0,
    };
  }
}

// ── Auth API ───────────────────────────────────────────────
export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  university_id?: number;
}): Promise<ApiResponse<AuthResponse>> {
  return fetchApi<AuthResponse>("/auth/register/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: {
  username: string;
  password: string;
  role?: string;
  university_id?: number;
}): Promise<ApiResponse<AuthResponse>> {
  return fetchApi<AuthResponse>("/auth/login/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verifyUniversityEmailApi(
  email: string,
  universityId?: number
): Promise<ApiResponse<{ accredited: boolean; university: any; message?: string }>> {
  return fetchApi("/auth/verify-university-email/", {
    method: "POST",
    body: JSON.stringify({ email, university_id: universityId }),
  });
}

export async function logoutUser(): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>("/auth/logout/", { method: "POST" });
}

export async function sendVerificationCode(email: string): Promise<ApiResponse<{ message: string }>> {
  return fetchApi("/auth/send-code/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyEmailCode(email: string, code: string): Promise<ApiResponse<AuthResponse>> {
  return fetchApi<AuthResponse>("/auth/verify-code/", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function resendVerificationCode(): Promise<ApiResponse<{ message: string }>> {
  return fetchApi("/auth/resend-code/", { method: "POST" });
}

export async function forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
  return fetchApi("/auth/forgot-password/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi("/auth/reset-password/", {
    method: "POST",
    body: JSON.stringify({ email, code, new_password: newPassword }),
  });
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  return fetchApi<User>("/auth/user/");
}

export async function activatePremium(): Promise<ApiResponse<{ message: string; is_premium: boolean }>> {
  return fetchApi("/auth/activate-premium/", { method: "POST" });
}

export async function getStudentProfile(): Promise<ApiResponse<StudentProfile>> {
  return fetchApi<StudentProfile>("/students/profile/");
}

export async function updateStudentProfile(
  data: Partial<StudentProfile> & {
    first_name?: string;
    last_name?: string;
    email?: string;
  }
): Promise<ApiResponse<StudentProfile>> {
  return fetchApi<StudentProfile>("/students/profile/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ── Scholarships API ───────────────────────────────────────
export async function getScholarships(
  params?: Record<string, string>
): Promise<ApiResponse<Scholarship[]>> {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return fetchApi<Scholarship[]>(`/scholarships/${query}`);
}

export async function getScholarship(
  id: number
): Promise<ApiResponse<ScholarshipDetail>> {
  return fetchApi<ScholarshipDetail>(`/scholarships/${id}/`);
}

// ── Universities API ───────────────────────────────────────
export async function getUniversities(): Promise<ApiResponse<University[]>> {
  return fetchApi<University[]>("/universities/");
}

// ── AI Chat API ────────────────────────────────────────────
export async function sendChatMessage(
  message: string,
  sessionId?: string,
  language?: string
): Promise<
  ApiResponse<{
    session_id: string;
    response: string;
    intent: string;
    metadata: Record<string, unknown>;
  }>
> {
  return fetchApi("/ai/chat/", {
    method: "POST",
    body: JSON.stringify({ message, session_id: sessionId, use_ai: true, language }),
  });
}

// ── Applications API ───────────────────────────────────────
export async function getApplications(): Promise<ApiResponse<unknown[]>> {
  return fetchApi<unknown[]>("/applications/");
}

// ── ScholarChina Application CRM Pipeline API ─────────────────
export interface ApplicationTrackerItem {
  id: number;
  scholarship_id?: number;
  scholarship: {
    id: number;
    title: string;
    level: string;
    type: string;
    amount?: string;
    currency?: string;
    application_deadline: string;
    application_link?: string;
    required_documents?: string[];
    university_id?: number;
    university_name?: string;
    university_city?: string;
    university_country?: string;
    days_until_deadline?: number | null;
    is_deadline_urgent?: boolean;
    is_deadline_passed?: boolean;
  };
  status: 'wishlist' | 'preparing_docs' | 'submitted' | 'interview' | 'accepted' | 'rejected';
  notes?: string | null;
  portal_application_id?: string | null;
  checklist?: Record<string, boolean>;
  checklist_progress?: {
    total: number;
    completed: number;
    percentage: number;
    all_done: boolean;
  };
  days_until_deadline?: number | null;
  is_deadline_urgent?: boolean;
  is_deadline_passed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrackerResponse {
  authenticated: boolean;
  applications: ApplicationTrackerItem[];
  grouped: {
    wishlist: ApplicationTrackerItem[];
    preparing_docs: ApplicationTrackerItem[];
    submitted: ApplicationTrackerItem[];
    interview: ApplicationTrackerItem[];
    accepted: ApplicationTrackerItem[];
    rejected: ApplicationTrackerItem[];
  };
  stats: {
    total: number;
    wishlist: number;
    preparing_docs: number;
    submitted: number;
    interview: number;
    accepted: number;
    rejected: number;
    urgent_deadlines: number;
  };
}

export async function getTrackedApplications(): Promise<ApiResponse<TrackerResponse>> {
  return fetchApi<TrackerResponse>("/tracker/");
}

export async function addToTracker(
  scholarshipId: number,
  status: string = "wishlist",
  notes: string = ""
): Promise<ApiResponse<ApplicationTrackerItem>> {
  return fetchApi<ApplicationTrackerItem>("/tracker/", {
    method: "POST",
    body: JSON.stringify({ scholarship_id: scholarshipId, status, notes }),
  });
}

export async function updateTrackedApplication(
  id: number,
  data: {
    status?: string;
    notes?: string;
    portal_application_id?: string;
    checklist?: Record<string, boolean>;
  }
): Promise<ApiResponse<ApplicationTrackerItem>> {
  return fetchApi<ApplicationTrackerItem>(`/tracker/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTrackedApplication(
  id: number
): Promise<ApiResponse<{ success: boolean }>> {
  return fetchApi<{ success: boolean }>(`/tracker/${id}/`, {
    method: "DELETE",
  });
}

