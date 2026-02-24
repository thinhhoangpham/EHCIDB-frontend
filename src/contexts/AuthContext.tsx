"use client";

import { createContext, useEffect, useState, useCallback } from "react";
import type { User } from "@/types/api";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  setAuth: (user: User, token: string, refresh: string) => void;
  clearAuth: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  // Initialize from localStorage on first mount
  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    const user = raw ? (JSON.parse(raw) as User) : null;
    setState({ user, token, isLoading: false });
  }, []);

  const setAuth = useCallback((user: User, token: string, refresh: string) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH, refresh);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
    setState({ user, token, isLoading: false });
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
    setState({ user: null, token: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
