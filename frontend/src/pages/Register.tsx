import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Register() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate registration
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Account created successfully! Please login.');
    navigate('/login');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-[500px] bg-white dark:bg-slate-900 rounded-2xl p-8 md:p-10 shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tighter mb-2">Sentinel Core</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Create your enterprise client account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input id="name" placeholder="Johnathan Sterling" className="pl-10" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Business Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input id="email" type="email" placeholder="j.sterling@enterprise.com" className="pl-10" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company">Company Name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input id="company" placeholder="Sterling Global Systems" className="pl-10" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input id="password" type="password" placeholder="••••••••••••" className="pl-10" required />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 font-bold shadow-lg mt-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Sign Up'
            )}
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
          Already registered? {' '}
          <Link to="/login" className="font-bold text-primary hover:underline">Log in to your account</Link>
        </p>
      </div>
    </div>
  );
}
