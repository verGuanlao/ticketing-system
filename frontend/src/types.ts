
export type UserRole = 'ADMIN' | 'SUPPORT_AGENT' | 'CLIENT';
export type UserStatus = 'ONLINE' | 'OFFLINE' | 'AWAY';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  isActive: boolean;
}

export interface Category {
  id: number;
  name: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdDate: string;
  resolvedDate?: string;
  categoryId: number;
  createdBy: number;
  assignedAgent?: number;
}

export interface Message {
  id: number;
  text: string;
  timestamp: string;
  ticketId: number;
  senderId: number;
}

export interface AgentWorkload {
  agentId: number;
  currentWorkload: number;
  maxCapacity: number;
}
