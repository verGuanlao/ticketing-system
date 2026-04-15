export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const API_URLS = {
  // Auth
  AUTH: `${API_BASE_URL}/api/auth`,
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/api/auth/register`,

  // Categories
  CATEGORIES: `${API_BASE_URL}/api/categories`,

  // Tickets
  TICKETS: `${API_BASE_URL}/api/tickets`,
  MY_TICKETS: `${API_BASE_URL}/api/tickets/my`,
  MY_ASSIGNED_TICKETS: `${API_BASE_URL}/api/tickets/my-assigned`,
  TICKETS_BY_AGENT: (agentId: number | string) => `${API_BASE_URL}/api/tickets/agent/${agentId}`,
  TICKETS_BY_STATUS: (status: string) => `${API_BASE_URL}/api/tickets/status/${status}`,

  // Ticket Actions (Specific ID endpoints)
  TICKET_BY_ID: (id: number | string) => `${API_BASE_URL}/api/tickets/${id}`,
  TICKET_ASSIGN: (id: number | string) => `${API_BASE_URL}/api/tickets/${id}/assign`,
  TICKET_AUTO_ASSIGN: (id: number | string) => `${API_BASE_URL}/api/tickets/${id}/auto-assign`,
  TICKET_STATUS: (id: number | string) => `${API_BASE_URL}/api/tickets/${id}/status`,
  TICKET_REASSIGN: (id: number | string) => `${API_BASE_URL}/api/tickets/${id}/reassign`,

  // Messages
  MESSAGES: (ticketId: number | string) => `${API_BASE_URL}/api/tickets/${ticketId}/messages`,
  MESSAGE_BY_ID: (ticketId: number | string, messageId: number | string) =>
    `${API_BASE_URL}/api/tickets/${ticketId}/messages/${messageId}`,

  // Users
  USERS: `${API_BASE_URL}/api/users`,
  USER_ME: `${API_BASE_URL}/api/users/me`,
  USER_MAX_WORKLOAD: '/users/max-workload',
  USER_BY_ID: (id: number | string) => `${API_BASE_URL}/api/users/${id}`,
  USER_BY_ROLE: (role: string) => `${API_BASE_URL}/api/users/role/${role}`,

  // Reports
  REPORTS_OVERVIEW: `${API_BASE_URL}/api/reports/overview`,
  REPORTS_AGENTS: `${API_BASE_URL}/api/reports/agents`,
  REPORTS_AGENT_BY_ID: (agentId: number | string) =>
    `${API_BASE_URL}/api/reports/agents/${agentId}`,
};
