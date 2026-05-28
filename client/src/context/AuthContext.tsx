import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authApi } from "../lib/api";
import type { AuthResponse, User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const tokenKey = "codetask-token";
const userKey = "codetask-user";

const readStoredUser = (): User | null => {
  const raw = localStorage.getItem(userKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

const persistSession = (session: AuthResponse) => {
  localStorage.setItem(tokenKey, session.token);
  localStorage.setItem(userKey, JSON.stringify(session.user));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(tokenKey));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.me(token);
        if (!cancelled) {
          setUser(response.user);
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem(tokenKey);
          localStorage.removeItem(userKey);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (email: string, password: string) => {
    const session = await authApi.login({ email, password });
    persistSession(session);
    setToken(session.token);
    setUser(session.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const session = await authApi.register({ name, email, password });
    persistSession(session);
    setToken(session.token);
    setUser(session.user);
  };

  const logout = () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
