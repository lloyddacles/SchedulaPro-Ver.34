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

interface Session {
  access_token: string;
  user: {
    id: string;
    email: string;
    user_metadata?: {
      name?: string;
      role?: UserRole;
    };
  };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  // ------------------- REAL BACKEND -------------------
  const checkSession = async () => {
    try {
      const backendSession = await apiService.getSession(); // returns Session or null
      if (backendSession) {
        setSession(backendSession);
        apiService.setAccessToken(backendSession.access_token);
        setUser({
          id: backendSession.user.id,
          email: backendSession.user.email,
          name: backendSession.user.user_metadata?.name,
          role: backendSession.user.user_metadata?.role as UserRole,
        });
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Real backend login
      const session = await apiService.signIn(email, password); // must return Session
      setSession(session);
      apiService.setAccessToken(session.access_token);
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name,
        role: session.user.user_metadata?.role as UserRole,
      });
      toast.success('Welcome back!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(`Sign in failed: ${error.message || error}`);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const user = await apiService.signUp(email, password, { name, role }); // must return Session
      // Auto sign in after signup
      await signIn(email, password);
      toast.success(`Welcome, ${name}!`);
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      console.error('Sign up error:', message);
      toast.error(`Sign up error: ${message}`);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await apiService.signOut();
      setSession(null);
      setUser(null);
      toast.success('Signed out successfully.');
    } catch (error) {
      console.error('Sign out error:', error);
      setSession(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}