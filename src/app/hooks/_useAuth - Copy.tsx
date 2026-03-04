import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { apiService } from '../services/ApiService';
import type { UserRole } from '../types';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;
}

interface AuthContextType {
  user: User | null;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Check for demo mode user first
      const demoUser = localStorage.getItem('demo_user');
      if (demoUser) {
        const parsedUser = JSON.parse(demoUser);
        apiService.setAccessToken('demo-token'); // Set token FIRST
        setUser(parsedUser);
        setLoading(false);
        return;
      }

      // Only check for real Supabase session if needed
      // Comment this out for pure demo mode
      /*
      const session = await apiService.getSession();
      
      if (session) {
        setSession(session);
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name,
          role: session.user.user_metadata?.role as UserRole,
        });
      }
      */
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Check if this is a demo user
      const demoUser = localStorage.getItem('demo_user');
      if (demoUser) {
        const parsedUser = JSON.parse(demoUser);
        if (parsedUser.email === email) {
          setUser(parsedUser);
          apiService.setAccessToken('demo-token');
          toast.success('Welcome back! Demo mode.');
          return;
        }
      }

      // For demo mode: Create a default user if no demo user exists
      // This allows the app to work without backend setup
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0],
        role: 'program_assistant' as UserRole,
      };
      
      apiService.setAccessToken('demo-token');
      localStorage.setItem('demo_user', JSON.stringify(mockUser));
      setUser(mockUser);
      toast.success(`Welcome! Demo mode activated.`);
      
      // Only attempt real authentication if explicitly needed
      // Uncomment below when you have real Supabase auth configured
      /*
      const session = await apiService.signIn(email, password);
      
      setSession(session);
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name,
        role: session.user.user_metadata?.role as UserRole,
      });
      */
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      // Demo mode: Allow any credentials for testing
      // Create a mock user for demo purposes
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        role,
      };
      
      // Set demo token FIRST before setting user to ensure API calls work
      apiService.setAccessToken('demo-token');
      localStorage.setItem('demo_user', JSON.stringify(mockUser));
      setUser(mockUser);
      toast.success(`Welcome, ${name}! Demo mode activated.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      console.error('Sign up error:', message);
      toast.error(`Sign up error: ${message}`);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      // Clear demo mode
      localStorage.removeItem('demo_user');
      
      // Try to sign out from Supabase, but don't fail if it errors
      try {
        await apiService.signOut();
      } catch (error) {
        console.log('Supabase signout skipped (demo mode)');
      }
      
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, still clear the user state
      setSession(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}