"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { User } from "@/lib/types";
import { getPrivateKey, clearKeyPair } from "@/lib/crypto";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
  refreshExpiresAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  publicKey: string | null;
  login: (user: User, publicKey: string) => void;
  logout: () => Promise<void>;
  isTokenExpired: (expiresAt: string | null) => boolean;
  getPrivateKeyForSigning: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const hasInitialized = useRef(false);

  const isTokenExpired = useCallback((expiresAt: string | null): boolean => {
    // Local auth doesn't use token expiry
    return false;
  }, []);

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Small delay to ensure smooth loader animation
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Load user from localStorage if exists
        const savedUser = localStorage.getItem("auth_user");
        if (savedUser) {
          const userData: User = JSON.parse(savedUser);
          setUser(userData);
          setPublicKey(userData.publicKey);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth().catch(() => {});
  }, []);

  const login = (user: User, publicKey: string) => {
    localStorage.setItem("auth_user", JSON.stringify(user));
    setUser(user);
    setPublicKey(publicKey);
  };

  const logout = async () => {
    if (user?.id) {
      clearKeyPair(user.id);
    }

    setUser(null);
    setPublicKey(null);

    try {
      localStorage.removeItem("auth_user");
    } catch (e) {
      // Silent
    }

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const getPrivateKeyForSigning = async (): Promise<string | null> => {
    if (!user?.id) {
      return null;
    }

    const privateKey = await getPrivateKey(user.id);
    return privateKey;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isInitialized,
        publicKey,
        login,
        logout,
        isTokenExpired,
        getPrivateKeyForSigning,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
