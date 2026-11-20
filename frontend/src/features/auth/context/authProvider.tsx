import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { LoginRequest, UserResponse } from "../../../types/auth";
import { getCurrentUser, login, logout } from "../api/auth-api";
import { AuthContext } from "./authContext";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [sessionAttempt, setSessionAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function restoreSession() {
      try {
        const currentUser = await getCurrentUser(controller.signal);
        if (!controller.signal.aborted) setUser(currentUser);
      } catch (error) {
        if (controller.signal.aborted) return;

        if (!isUnauthorized(error)) {
          setSessionError("Could not check your session. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void restoreSession();
    return () => controller.abort();
  }, [sessionAttempt]);

  function retrySession() {
    setIsLoading(true);
    setSessionError(null);
    setSessionAttempt((attempt) => attempt + 1);
  }

  async function signIn(credentials: LoginRequest) {
    await login(credentials);

    // Confirm that the browser can send the new auth cookie and load the full profile.
    try {
      setUser(await getCurrentUser());
      setSessionError(null);
    } catch (error) {
      if (isUnauthorized(error)) {
        throw new Error(
          "Could not start your session. Open the bookstore on localhost or HTTPS and allow cookies.",
          { cause: error },
        );
      }
      throw new Error("Could not verify your session. Please try again.", { cause: error });
    }
  }

  async function signOut() {
    try {
      await logout();
    } catch (error) {
      if (!isUnauthorized(error)) throw error;
    }

    setUser(null);
    setSessionError(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, sessionError, retrySession, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

function isUnauthorized(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401;
}
