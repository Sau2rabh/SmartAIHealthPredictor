"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (savedToken && savedUser && savedUser !== "undefined" && savedUser !== "null") {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser._id) {
          setToken(savedToken);
          setUser(parsedUser);
        } else {
          throw new Error("Invalid user object");
        }
      } catch (err) {
        console.error("Error parsing user data:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } else if (savedToken) {
      // Token exists but no user data - clear to avoid broken state
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setLoading(true);
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setLoading(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
