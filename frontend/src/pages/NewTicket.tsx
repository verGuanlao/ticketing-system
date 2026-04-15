import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, AlertCircle, Loader2, CheckCircle2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MOCK_CATEGORIES, MOCK_USERS, MOCK_WORKLOADS } from '@/mockData';
import { TicketPriority } from '@/types';
import { toast } from 'sonner';
import { useTickets } from '@/contexts/TicketContext';
import { useAuth } from '@/contexts/AuthContext';

export default function NewTicket() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { addTicket, editTicket, tickets } = useTickets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as TicketPriority,
    categoryId: '',
  });

  useEffect(() => {
    if (isEditing && tickets.length > 0) {
      const ticket = tickets.find(t => t.id === parseInt(id));
      if (ticket) {
        // Check permissions: only creator or agent/admin can edit
        if (user?.role === 'CLIENT' && ticket.createdBy !== user.id) {
          toast.error("You don't have permission to edit this ticket");
          navigate('/tickets');
          return;
        }
        
        setFormData({
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
          categoryId: ticket.categoryId.toString(),
        });
      }
    }
  }, [id, tickets, isEditing, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    if (isEditing) {
      editTicket(parseInt(id), {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        categoryId: parseInt(formData.categoryId),
      });
      toast.success(`Ticket #${id} updated successfully`);
    } else {
      // Simulate workload allocation logic
      const agents = MOCK_USERS.filter(u => u.role === 'SUPPORT_AGENT');
      const sortedWorkloads = [...MOCK_WORKLOADS].sort((a, b) => a.currentWorkload - b.currentWorkload);
      const bestAgentId = sortedWorkloads[0]?.agentId || agents[0]?.id;
      const bestAgent = MOCK_USERS.find(u => u.id === bestAgentId);

      addTicket({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: 'OPEN',
        categoryId: parseInt(formData.categoryId),
        createdBy: user.id,
        assignedAgent: bestAgentId,
      });
      toast.success(`Ticket created and assigned to ${bestAgent?.firstName} ${bestAgent?.lastName}`);
    }

    navigate('/tickets');
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-3">
          {isEditing ? 'Modify Incident' : 'Initialize Incident'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          {isEditing ? `Updating parameters for Ticket #${id}` : 'Provide technical parameters for the support request.'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="pb-10 pt-10 px-10">
            <CardTitle className="text-2xl font-bold tracking-tight">Ticket Parameters</CardTitle>
            <CardDescription className="text-base">All fields are required for priority assessment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 px-10 pb-10">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-black uppercase tracking-wider text-slate-500">Subject Line</Label>
              <Input 
                id="title" 
                placeholder="e.g., Database Connection Timeout in Production" 
                className="h-11 bg-slate-50 dark:bg-slate-800 border-none font-medium"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs font-black uppercase tracking-wider text-slate-500">Category</Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(v) => setFormData({...formData, categoryId: v})}
                  required
                >
                  <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-800 border-none font-medium">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-xs font-black uppercase tracking-wider text-slate-500">Priority Level</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(v) => setFormData({...formData, priority: v as TicketPriority})}
                  required
                >
                  <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-800 border-none font-medium">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-black uppercase tracking-wider text-slate-500">Detailed Description</Label>
              <textarea 
                id="description"
                className="w-full min-h-[150px] bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder="Describe the technical issue, steps to reproduce, and observed behavior..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            {!isEditing && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-4">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  <p className="font-bold mb-1 uppercase tracking-wider">Automated Workload Balancing</p>
                  Your ticket will be automatically routed to the most available agent based on current system capacity and ticket priority.
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-800/50 p-10 flex justify-between items-center">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="font-bold">Cancel</Button>
            <Button type="submit" className="font-bold px-8 h-11 shadow-lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Allocating Resources...'}
                </>
              ) : (
                <span className="flex items-center gap-2">
                  {isEditing ? <Save className="w-4 h-4" /> : null}
                  {isEditing ? 'Update Parameters' : 'Submit Ticket'}
                </span>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
