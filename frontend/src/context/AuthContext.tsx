import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AuthUser, Role } from '../lib/types';

/* ==============================
   Auth Context
   ============================== */

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (name: string, role: Role) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const setAuth = useCallback((name: string, role: Role) => {
    setUser({ name, role });
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
  }, []);

  // Listen for 401 events dispatched by the Axios interceptor
  useEffect(() => {
    const handler = () => clearAuth();
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
