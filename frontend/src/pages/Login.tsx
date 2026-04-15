import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { login } from '@/lib/utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Call the API utility function
    const response = await login({ email, password });

    if (response && response.success) {
      console.log(response.message);
      toast.success(response.message || 'Welcome back to Sentinel Core');

      navigate('/dashboard');
    } else {
      const errorMsg = response?.message || 'Invalid credentials. Please try again.';
      toast.error(errorMsg);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="grid w-full max-w-[1000px] grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
        {/* Left Side: Branding */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-100 p-12 md:flex dark:bg-slate-800">
          <div className="relative z-10">
            <div className="mb-12 flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-black tracking-tighter">Sentinel Core</span>
            </div>
            <h1 className="mb-6 text-4xl leading-tight font-extrabold tracking-tight">
              Enter the Precise <br />
              Monolith.
            </h1>
            <p className="max-w-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Access the industry's most authoritative support desk environment. Designed for
              clarity, built for speed.
            </p>
          </div>

          <div className="relative z-10">
            <div className="mb-4 flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <img
                  key={i}
                  className="h-10 w-10 rounded-full border-2 border-slate-100 dark:border-slate-800"
                  src={`https://i.pravatar.cc/150?u=${i + 10}`}
                  alt="User"
                />
              ))}
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Joined by over 10,000+ support professionals today.
            </p>
          </div>

          <div className="absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        </div>

        {/* Right Side: Login Form */}
        <div className="flex flex-col justify-center p-8 md:p-16">
          <div className="mb-10">
            <h2 className="mb-2 text-2xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Please enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@example.com"
                  className="h-11 border-none bg-slate-50 pl-10 dark:bg-slate-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs font-semibold text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 border-none bg-slate-50 pl-10 dark:bg-slate-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full font-bold shadow-lg"
              disabled={isSubmitting}
            >
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

          <div className="mt-10 border-t border-slate-100 pt-8 dark:border-slate-800">
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
