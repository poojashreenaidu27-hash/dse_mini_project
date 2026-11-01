// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { apiGet, apiPost } from '../lib/api';
import type { ApiResponse } from '../lib/api';
import type { User, AuthSessionResponse } from '../types';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // On mount, check if an active session cookie exists
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res: ApiResponse<User> = await apiGet<User>('/api/v1/auth/me');
        if (isMounted && res.data && !res.error) {
          setUser(res.data);
        }
      } catch {
        // User is not logged in
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const payload = { email: email.trim().toLowerCase(), password };
    const res: ApiResponse<AuthSessionResponse> = await apiPost<AuthSessionResponse, typeof payload>(
      '/api/v1/auth/login',
      payload
    );
    if (res.error) {
      throw new Error(res.error);
    }
    if (res.data?.user) {
      setUser(res.data.user);
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    const payload = {
      email: email.trim().toLowerCase(),
      password,
      display_name: displayName.trim(),
    };
    const res: ApiResponse<AuthSessionResponse> = await apiPost<AuthSessionResponse, typeof payload>(
      '/api/v1/auth/register',
      payload
    );
    if (res.error) {
      throw new Error(res.error);
    }
    if (res.data?.user) {
      setUser(res.data.user);
    }
  };

  const logout = async () => {
    try {
      await apiPost('/api/v1/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
