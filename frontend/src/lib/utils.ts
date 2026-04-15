import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { API_URLS } from '@/config/apiConfig';
import api from '@/lib/axiosConfig';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Enums ---
export enum Role {
  ADMIN = 'ADMIN',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
  CLIENT = 'CLIENT',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OFFLINE = 'OFFLINE',
}

export enum TicketStatus {
  PENDING = 'PENDING',
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

// --- Base Response Wrapper ---
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// --- Auth Types ---
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface AuthResponse {
  userId: number;
  email: string;
  fullName: string;
  role: Role;
  accessToken?: string; // Extracted from header in config
}

// --- User Types ---
export interface CreateUserRequest extends RegisterRequest {
  role: Role;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  status: Status;
  fullName: string;
}

// --- Category Types ---
export interface CategoryRequest {
  name: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
}

// --- Ticket Types ---
export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: number;
  categoryId: number;
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  priority?: number;
  status?: TicketStatus;
  categoryId?: number;
}

export interface AssignTicketRequest {
  agentId: number;
}

export interface TicketResponse {
  id: number;
  title: string;
  description: string;
  priority: number;
  priorityLabel: string;
  status: TicketStatus;
  createdDate: string;
  resolvedDate?: string;
  category: CategoryResponse;
  createdBy: string;
  assignedAgent?: string;
}

// --- Message Types ---
export interface CreateMessageRequest {
  text: string;
}

export interface MessageResponse {
  id: number;
  text: string;
  timestamp: string;
  ticketId: number;
  sender: UserResponse;
}

// --- Report Types ---
export interface AgentPerformanceResponse {
  agent: UserResponse;
  totalAssigned: number;
  activeTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  averageResolutionTimeHours: number;
  workload: number;
}

export interface ReportResponse {
  totalTickets: number;
  pendingTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  averageResolutionTimeHours: number;
  ticketsByCategory: Record<string, number>;
  ticketsByPriority: Record<string, number>;
  agentPerformance: Record<string, AgentPerformanceResponse>;
}

// --- Authentication ---
/** * AUTHENTICATION METHODS
 **/

export async function register(request: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await api.post<ApiResponse<AuthResponse>>(API_URLS.AUTH_REGISTER, request);
    return response.data;
  } catch (error: any) {
    // Cast the error response to maintain consistent return types
    return error.response?.data as ApiResponse<AuthResponse>;
  }
}

export async function login(request: LoginRequest): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await api.post<ApiResponse<AuthResponse>>(API_URLS.AUTH_LOGIN, request);

    // Extract Bearer token from the 'Authorization' header
    const token = response.headers['authorization']?.replace('Bearer ', '');

    if (token) {
      localStorage.setItem('accessToken', token);
    }

    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<AuthResponse>;
  }
}

export function logout(): void {
  localStorage.removeItem('accessToken');
  // Optional: clear other user-related data or redirect
  window.location.href = '/login';
}

/** * TICKET API METHODS
 **/

// Create a new ticket (Automatically assigned or PENDING)
export async function createTicket(
  request: CreateTicketRequest
): Promise<ApiResponse<TicketResponse>> {
  try {
    const response = await api.post<ApiResponse<TicketResponse>>(API_URLS.TICKETS, request);
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<TicketResponse>;
  }
}

// Get ticket details by ID (Admin/Agent/Owner)
export async function getTicketById(id: number): Promise<ApiResponse<TicketResponse>> {
  try {
    const response = await api.get<ApiResponse<TicketResponse>>(API_URLS.TICKET_BY_ID(id));
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<TicketResponse>;
  }
}

// Get all tickets (Admin only)
export async function getAllTickets(): Promise<ApiResponse<TicketResponse[]>> {
  try {
    const response = await api.get<ApiResponse<TicketResponse[]>>(API_URLS.TICKETS);
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<TicketResponse[]>;
  }
}

// Get tickets created by the logged-in user
export async function getMyTickets(): Promise<ApiResponse<TicketResponse[]>> {
  try {
    const response = await api.get<ApiResponse<TicketResponse[]>>(API_URLS.MY_TICKETS);
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<TicketResponse[]>;
  }
}

// Get tickets assigned to the logged-in agent
export async function getMyAssignedTickets(): Promise<ApiResponse<TicketResponse[]>> {
  try {
    const response = await api.get<ApiResponse<TicketResponse[]>>(API_URLS.MY_ASSIGNED_TICKETS);
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<TicketResponse[]>;
  }
}

// Update ticket title, description, or other allowed fields
export async function updateTicket(
  id: number,
  request: UpdateTicketRequest
): Promise<ApiResponse<TicketResponse>> {
  try {
    const response = await api.put<ApiResponse<TicketResponse>>(API_URLS.TICKET_BY_ID(id), request);
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<TicketResponse>;
  }
}

// Manually assign an agent to a ticket (Admin only)
export async function assignTicket(
  id: number,
  request: AssignTicketRequest
): Promise<ApiResponse<TicketResponse>> {
  try {
    const response = await api.patch<ApiResponse<TicketResponse>>(
      API_URLS.TICKET_ASSIGN(id),
      request
    );
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<TicketResponse>;
  }
}

// Manually trigger auto-assignment (Admin only)
export async function autoAssignTicket(id: number): Promise<ApiResponse<TicketResponse>> {
  try {
    const response = await api.patch<ApiResponse<TicketResponse>>(API_URLS.TICKET_AUTO_ASSIGN(id));
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<TicketResponse>;
  }
}

// Update ticket status (e.g., OPEN -> IN_PROGRESS -> RESOLVED)
export async function updateTicketStatus(
  id: number,
  status: TicketStatus
): Promise<ApiResponse<TicketResponse>> {
  try {
    // Note: Passed as a RequestParam in your controller
    const response = await api.patch<ApiResponse<TicketResponse>>(
      `${API_URLS.TICKET_STATUS(id)}?status=${status}`
    );
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<TicketResponse>;
  }
}

// Request reassignment for a PENDING ticket
export async function requestReassignment(id: number): Promise<ApiResponse<TicketResponse>> {
  try {
    const response = await api.patch<ApiResponse<TicketResponse>>(API_URLS.TICKET_REASSIGN(id));
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<TicketResponse>;
  }
}

// Delete a ticket (Admin only, usually for CLOSED status)
export async function deleteTicket(id: number): Promise<ApiResponse<void>> {
  try {
    const response = await api.delete<ApiResponse<void>>(API_URLS.TICKET_BY_ID(id));
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<void>;
  }
}

/** * CATEGORY API METHODS
 **/

// Create a new category (Admin only)
export async function createCategory(
  request: CategoryRequest
): Promise<ApiResponse<CategoryResponse>> {
  try {
    const response = await api.post<ApiResponse<CategoryResponse>>(API_URLS.CATEGORIES, request);
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<CategoryResponse>;
  }
}

// Get all available categories
export async function getAllCategories(): Promise<ApiResponse<CategoryResponse[]>> {
  try {
    const response = await api.get<ApiResponse<CategoryResponse[]>>(API_URLS.CATEGORIES);
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<CategoryResponse[]>;
  }
}

// Get a single category by ID
export async function getCategoryById(id: number): Promise<ApiResponse<CategoryResponse>> {
  try {
    const response = await api.get<ApiResponse<CategoryResponse>>(`${API_URLS.CATEGORIES}/${id}`);
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<CategoryResponse>;
  }
}

// Update an existing category name (Admin only)
export async function updateCategory(
  id: number,
  request: CategoryRequest
): Promise<ApiResponse<CategoryResponse>> {
  try {
    const response = await api.put<ApiResponse<CategoryResponse>>(
      `${API_URLS.CATEGORIES}/${id}`,
      request
    );
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<CategoryResponse>;
  }
}

// Delete a category (Admin only - fails if tickets are attached)
export async function deleteCategory(id: number): Promise<ApiResponse<void>> {
  try {
    const response = await api.delete<ApiResponse<void>>(`${API_URLS.CATEGORIES}/${id}`);
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<void>;
  }
}

/** * MESSAGE API METHODS
 **/

// Add a message/comment to a specific ticket
export async function addMessage(
  ticketId: number,
  request: CreateMessageRequest
): Promise<ApiResponse<MessageResponse>> {
  try {
    const response = await api.post<ApiResponse<MessageResponse>>(
      API_URLS.MESSAGES(ticketId),
      request
    );
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<MessageResponse>;
  }
}

// Get all messages for a specific ticket
export async function getTicketMessages(ticketId: number): Promise<ApiResponse<MessageResponse[]>> {
  try {
    const response = await api.get<ApiResponse<MessageResponse[]>>(API_URLS.MESSAGES(ticketId));
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<MessageResponse[]>;
  }
}

// Delete a message (Sender or Admin only)
export async function deleteMessage(
  ticketId: number,
  messageId: number
): Promise<ApiResponse<void>> {
  try {
    const response = await api.delete<ApiResponse<void>>(
      API_URLS.MESSAGE_BY_ID(ticketId, messageId)
    );
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<void>;
  }
}

/** * USER API METHODS
 **/

// Get the profile of the currently authenticated user
export async function getCurrentUser(): Promise<ApiResponse<UserResponse>> {
  try {
    const response = await api.get<ApiResponse<UserResponse>>(API_URLS.USER_ME);
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<UserResponse>;
  }
}

// Get a specific user by ID (Admin or the user themselves)
export async function getUserById(id: number): Promise<ApiResponse<UserResponse>> {
  try {
    const response = await api.get<ApiResponse<UserResponse>>(API_URLS.USER_BY_ID(id));
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<UserResponse>;
  }
}

// Get all users in the system (Admin only)
export async function getAllUsers(): Promise<ApiResponse<UserResponse[]>> {
  try {
    const response = await api.get<ApiResponse<UserResponse[]>>(API_URLS.USERS);
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<UserResponse[]>;
  }
}

// Get users filtered by their role (Admin only)
export async function getUsersByRole(role: Role): Promise<ApiResponse<UserResponse[]>> {
  try {
    const response = await api.get<ApiResponse<UserResponse[]>>(API_URLS.USER_BY_ROLE(role));
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<UserResponse[]>;
  }
}

// Create a new user manually (Admin only)
export async function createUser(request: CreateUserRequest): Promise<ApiResponse<UserResponse>> {
  try {
    const response = await api.post<ApiResponse<UserResponse>>(API_URLS.USERS, request);
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<UserResponse>;
  }
}

// Change user status (Active/Inactive) via RequestParam (Admin only)
export async function changeUserStatus(
  id: number,
  status: Status
): Promise<ApiResponse<UserResponse>> {
  try {
    // Note: status is passed as a query parameter (?status=...) based on your @RequestParam
    const response = await api.put<ApiResponse<UserResponse>>(
      `${API_URLS.USER_BY_ID(id)}?status=${status}`
    );
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<UserResponse>;
  }
}

// Delete a user (Admin only, cannot delete self)
export async function deleteUser(id: number): Promise<ApiResponse<void>> {
  try {
    const response = await api.delete<ApiResponse<void>>(API_URLS.USER_BY_ID(id));
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<void>;
  }
}

/** * REPORT API METHODS (Admin Only)
 **/

// Get the overall system report (tickets by status, category, priority, etc.)
export async function getOverallReport(): Promise<ApiResponse<ReportResponse>> {
  try {
    const response = await api.get<ApiResponse<ReportResponse>>(API_URLS.REPORTS_OVERVIEW);
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<ReportResponse>;
  }
}

// Get performance metrics for all support agents
export async function getAgentPerformanceReport(): Promise<
  ApiResponse<AgentPerformanceResponse[]>
> {
  try {
    const response = await api.get<ApiResponse<AgentPerformanceResponse[]>>(
      API_URLS.REPORTS_AGENTS
    );
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<AgentPerformanceResponse[]>;
  }
}

// Get performance metrics for a specific support agent by their ID
export async function getAgentPerformanceById(
  agentId: number
): Promise<ApiResponse<AgentPerformanceResponse>> {
  try {
    const response = await api.get<ApiResponse<AgentPerformanceResponse>>(
      API_URLS.REPORTS_AGENT_BY_ID(agentId)
    );
    return response.data;
  } catch (error: any) {
    return error.response?.data as ApiResponse<AgentPerformanceResponse>;
  }
}

export function formatDate(date: string | Date | undefined) {
  if (!date) return '-';
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}
