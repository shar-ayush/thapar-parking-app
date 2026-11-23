import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

import {
  ApiError,
  clearTokens,
  getMe,
  loadApiUrl,
  login as apiLogin,
  logout as apiLogout,
  onSessionExpired,
  register as apiRegister,
} from "../../services/api";

export type Role = "STUDENT" | "FACULTY" | "VISITOR" | "VENDOR" | "GUARD" | "ADMIN";

export type User = {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: Role;
  created_at: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  hasServer: boolean;
  setHasServer: (v: boolean) => void;
  setUser: (u: User) => void;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string, phone: string, role: string) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

/** Where each role lands after signing in. Everyone who parks shares the driver app. */
export function homeFor(role?: string) {
  if (role === "GUARD") return "/guard";
  if (role === "ADMIN") return "/admin";
  return "/student";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasServer, setHasServer] = useState(false);

  useEffect(() => {
    // Refresh token expired or revoked -> back to the login screen.
    onSessionExpired(() => {
      setUserState(null);
      router.replace("/login");
    });
    restoreSession();
    return () => onSessionExpired(null);
  }, []);

  async function restoreSession() {
    try {
      const saved = await loadApiUrl(); // server link must be known before any API call
      setHasServer(!!saved);
      if (!saved) return;

      const token = await SecureStore.getItemAsync("access_token");
      if (!token) return;

      const data = await getMe();
      setUserState(data.user);
    } catch (error) {
      // Only drop the session when the server actually rejected it; if the
      // server is just unreachable the user stays signed in for next time.
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        await clearTokens();
      }
      setUserState(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const data = await apiLogin(email, password);
    setUserState(data.user);
    return data.user as User;
  }

  async function register(email: string, password: string, name: string, phone: string, role: string) {
    const data = await apiRegister(email, password, name, phone, role);
    setUserState(data.user);
    return data.user as User;
  }

  async function logout() {
    try {
      await apiLogout();
    } catch {
      // The local session is cleared regardless.
    } finally {
      setUserState(null);
      await clearTokens();
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, hasServer, setHasServer, setUser: setUserState, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
