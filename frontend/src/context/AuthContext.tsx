import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AuthUser, Role } from '../lib/types';
import api from '../lib/axios';

/* ==============================
   Auth Context
   
   Persists user info in localStorage as a stopgap until
   a GET /auth/me endpoint is added to the backend.
   The JWT HttpOnly cookie is still the source of truth
   for the backend — localStorage only stores display info.
   ============================== */

const STORAGE_KEY = 'learnvault_user';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (name: string, role: Role) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadPersistedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.name && parsed?.role) return parsed as AuthUser;
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadPersistedUser);

  const setAuth = useCallback((name: string, role: Role) => {
    const authUser: AuthUser = { name, role };
    setUser(authUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Listen for 401 events dispatched by the Axios interceptor
  useEffect(() => {
    const handler = () => clearAuth();
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [clearAuth]);

  // Sync session from backend cookie on boot
  useEffect(() => {
    const syncSession = async () => {
      try {
        const res = await api.get<{ name: string; username: string; email: string; role: Role }>('/api/v1/auth/me');
        if (res.data?.name && res.data?.role) {
          setAuth(res.data.name, res.data.role);
        }
      } catch {
        clearAuth();
      }
    };
    syncSession();
  }, [setAuth, clearAuth]);

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
