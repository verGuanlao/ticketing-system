import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ticket, TicketStatus, TicketPriority } from '@/types';
import { MOCK_TICKETS } from '@/mockData';

interface TicketContextType {
  tickets: Ticket[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdDate'>) => void;
  updateTicketStatus: (ticketId: number, status: TicketStatus) => void;
  reassignTicket: (ticketId: number, agentId: number) => void;
  deleteTicket: (ticketId: number) => void;
  editTicket: (ticketId: number, updates: Partial<Ticket>) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('sentinel_tickets');
    if (saved) {
      setTickets(JSON.parse(saved));
    } else {
      setTickets(MOCK_TICKETS);
    }
  }, []);

  useEffect(() => {
    if (tickets.length > 0) {
      localStorage.setItem('sentinel_tickets', JSON.stringify(tickets));
    }
  }, [tickets]);

  const addTicket = (ticketData: Omit<Ticket, 'id' | 'createdDate'>) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: Math.max(0, ...tickets.map(t => t.id)) + 1,
      createdDate: new Date().toISOString(),
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const updateTicketStatus = (ticketId: number, status: TicketStatus) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const updates: Partial<Ticket> = { status };
        if (status === 'RESOLVED') {
          updates.resolvedDate = new Date().toISOString();
        } else if (status === 'OPEN' || status === 'IN_PROGRESS') {
          updates.resolvedDate = undefined;
        }
        return { ...t, ...updates };
      }
      return t;
    }));
  };

  const reassignTicket = (ticketId: number, agentId: number) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, assignedAgent: agentId } : t));
  };

  const deleteTicket = (ticketId: number) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
  };

  const editTicket = (ticketId: number, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...updates } : t));
  };

  return (
    <TicketContext.Provider value={{ tickets, addTicket, updateTicketStatus, reassignTicket, deleteTicket, editTicket }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) throw new Error('useTickets must be used within a TicketProvider');
  return context;
};
