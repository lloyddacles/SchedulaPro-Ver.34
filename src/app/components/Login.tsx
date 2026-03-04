import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import type { UserRole } from '../types';

export function Login() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'program_assistant' as UserRole,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password, formData.name, formData.role);
        toast.success('Account created successfully!');
      } else {
        await signIn(formData.email, formData.password);
        toast.success('Signed in successfully!');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">SP</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">SchedulaPro</CardTitle>
          <CardDescription className="text-center">
            {isSignUp ? 'Create a new account' : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={isSignUp}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="program_assistant">Program Assistant</SelectItem>
                    <SelectItem value="program_head">Program Head</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {!isSignUp && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200 font-medium mb-2">Demo Mode:</p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                Create any account to test the system. Email confirmation is not required in demo mode.
              </p>
              <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                <div className="font-medium">Suggested test accounts:</div>
                <div>• assistant@test.com (Program Assistant)</div>
                <div>• head@test.com (Program Head)</div>
                <div>• admin@test.com (Administrator)</div>
                <div>• faculty@test.com (Faculty)</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}