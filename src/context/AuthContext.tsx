import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getCurrentAccount } from "../services/account.service";
import {
  clearAuthSession,
  getAuthToken,
  getAuthenticatedUser,
} from "../services/auth.service";
import type { AuthenticatedUser } from "../types/auth.types";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  completeAuthentication: (user: AuthenticatedUser) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const saveStoredUser = (user: AuthenticatedUser) => {
  localStorage.setItem("edutrack_user", JSON.stringify(user));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(() => getAuthenticatedUser());
  const [isInitializing, setIsInitializing] = useState(true);

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
  }, []);

  const completeAuthentication = useCallback((nextUser: AuthenticatedUser) => {
    saveStoredUser(nextUser);
    setUser(nextUser);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getAuthToken()) {
      logout();
      return;
    }

    const nextUser = await getCurrentAccount();
    saveStoredUser(nextUser);
    setUser(nextUser);
  }, [logout]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const initialize = async () => {
        if (!getAuthToken()) {
          setUser(null);
          setIsInitializing(false);
          return;
        }

        try {
          await refreshUser();
        } catch {
          logout();
        } finally {
          setIsInitializing(false);
        }
      };

      void initialize();
    }, 0);

    const handleUnauthorized = () => logout();
    window.addEventListener("edutrack:unauthorized", handleUnauthorized);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("edutrack:unauthorized", handleUnauthorized);
    };
  }, [logout, refreshUser]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isInitializing,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role.name.toLowerCase() === "admin",
    completeAuthentication,
    refreshUser,
    logout,
  }), [completeAuthentication, isInitializing, logout, refreshUser, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// AuthProvider and useAuth intentionally share the same module to keep the context private.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  }

  return context;
};
