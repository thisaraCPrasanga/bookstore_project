import { createContext, useContext } from "react";
import type { LoginRequest, UserResponse } from "../../../types/auth";

interface AuthContextValue {
  user: UserResponse | null;
  isLoading: boolean;
  sessionError: string | null;
  retrySession: () => void;
  signIn: (credentials: LoginRequest) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
