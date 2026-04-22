// import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// import { User, Session } from '@supabase/supabase-js';
// import { supabase } from '../lib/supabase';

// interface AuthContextType {
//   user: User | null;
//   session: Session | null;
//   loading: boolean;
//   signIn: (email: string, password: string) => Promise<{ error: any }>;
//   signUp: (email: string, password: string) => Promise<{ error: any }>;
//   signOut: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [session, setSession] = useState<Session | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//       setUser(session?.user ?? null);
//       setLoading(false);
//     });

//     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
//       (async () => {
//         setSession(session);
//         setUser(session?.user ?? null);
//         setLoading(false);
//       })();
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   const signIn = async (email: string, password: string) => {
//     const { error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });
//     return { error };
//   };

//   const signUp = async (email: string, password: string) => {
//     const { error } = await supabase.auth.signUp({
//       email,
//       password,
//     });
//     return { error };
//   };

//   const signOut = async () => {
//     await supabase.auth.signOut();
//   };

//   const value = {
//     user,
//     session,
//     loading,
//     signIn,
//     signUp,
//     signOut,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }


import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { login, signup } from '../services/apiService';

interface User {
  id: string;
  email: string | null;
  isOnboarded: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  signUp: (email: string, password: string) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
  refreshToken: (newToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseUserFromToken(token: string, email: string | null = null): User | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.user_id,
      email,
      isOnboarded: payload.is_onboarded === true,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const parsed = parseUserFromToken(token);
      if (parsed) {
        setUser(parsed);
      } else {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const refreshToken = useCallback((newToken: string) => {
    localStorage.setItem('token', newToken);
    const parsed = parseUserFromToken(newToken, user?.email ?? null);
    if (parsed) setUser(parsed);
  }, [user?.email]);

  const value = {
    user,
    loading,
    refreshToken,
    signIn: async (email: string, password: string) => {
      try {
        const data = await login(email, password);
        localStorage.setItem('token', data.token);
        const parsed = parseUserFromToken(data.token, email);
        setUser(parsed);
        return { error: null };
      } catch (err: unknown) {
        if (err instanceof Error) return { error: { message: err.message } };
        return { error: { message: 'An unknown error occurred' } };
      }
    },
    signUp: async (email: string, password: string) => {
      try {
        const data = await signup(email, password);
        localStorage.setItem('token', data.token);
        const parsed = parseUserFromToken(data.token, email);
        setUser(parsed);
        return { error: null };
      } catch (err: unknown) {
        if (err instanceof Error) return { error: { message: err.message } };
        return { error: { message: 'An unknown error occurred' } };
      }
    },
    signOut: async () => {
      localStorage.removeItem('token');
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}