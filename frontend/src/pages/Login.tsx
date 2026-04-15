import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('admin@sentinel.com');
  const [password, setPassword] = useState('password');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email);
      toast.success('Welcome back to Sentinel Core');
      navigate('/');
    } catch (error) {
      toast.error('Invalid credentials. Try admin@sentinel.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="hidden md:flex flex-col justify-between p-12 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-12">
              <Shield className="text-primary w-8 h-8" />
              <span className="text-2xl font-black tracking-tighter">Sentinel Core</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-6">
              Enter the Precise <br />Monolith.
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              Access the industry's most authoritative support desk environment. Designed for clarity, built for speed.
            </p>
          </div>
          
          <div className="relative z-10">
            <div className="flex -space-x-3 mb-4">
              {[1, 2, 3].map((i) => (
                <img 
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-800" 
                  src={`https://i.pravatar.cc/150?u=${i + 10}`}
                  alt="User"
                />
              ))}
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Joined by over 10,000+ support professionals today.
            </p>
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        </div>

        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Please enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="agent@sentinelcore.com" 
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs font-semibold text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 font-bold shadow-lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account? {' '}
              <Link to="/register" className="font-bold text-primary hover:underline">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
