import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { register } from '@/lib/utils'; // Ensure this matches your file path

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim();

    const response = await register({
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail,
      password,
    });

    if (response && response.success) {
      toast.success(response.message || 'Account created successfully! Please login.');
      navigate('/login');
    } else {
      toast.error(response?.message || 'Registration failed. Please try again.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="relative w-full max-w-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl md:p-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="absolute top-0 left-0 h-1 w-full bg-primary" />

        <div className="mb-10 text-center">
          <div className="mb-4 flex justify-center">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="mb-2 text-3xl font-extrabold tracking-tighter">Sentinel Core</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Create your enterprise client account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First Name & Last Name Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="firstName"
                  placeholder="Johnathan"
                  className="pl-10 placeholder:text-slate-500/40 placeholder:italic dark:placeholder:text-slate-400/30"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <div className="relative">
                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="lastName"
                  placeholder="Sterling"
                  className="pl-10 placeholder:text-slate-500/40 placeholder:italic dark:placeholder:text-slate-400/30"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Business Email</Label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="j.sterling@enterprise.com"
                className="pl-10 placeholder:text-slate-500/40 placeholder:italic dark:placeholder:text-slate-400/30"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                className="pl-10 placeholder:text-slate-500/40 placeholder:italic dark:placeholder:text-slate-400/30"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="mt-2 h-12 w-full font-bold shadow-lg"
            disabled={isSubmitting}
          >
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

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Log in to your account
          </Link>
        </p>
      </div>
    </div>
  );
}
