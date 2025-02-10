// src/hooks/authContext.tsx

import { createContext, useContext, useState, useEffect } from 'react';
import loginController from '../controllers/loginController';
import {
  User,
  Role,
  LoginCredentials,
  LoginResponse,
  AuthContextType,
} from '../interface/interface';

// Since we've moved all interfaces to a separate file, we can now focus on the implementation
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize state using localStorage, with proper typing from our interfaces
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('token')
  );

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [role, setRole] = useState<Role | null>(() => {
    const savedRole = localStorage.getItem('role');
    return savedRole ? JSON.parse(savedRole) : null;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await loginController.checkAndRefreshToken();
      if (!isValid) {
        setToken(null);
        setUser(null);
        setRole(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (
    credentials: LoginCredentials
  ): Promise<LoginResponse> => {
    const response = await loginController.login(credentials);

    if (response && response.success && response.data) {
      setToken(response.data.access_token);
      setUser(response.data.user);
      setRole(response.data.role);
      return response; // Return a valid LoginResponse
    }

    // Provide a default LoginResponse with `undefined` for `data`
    return { success: false, data: undefined };
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();

    setToken(null);
    setUser(null);
    setRole(null);
  };

  const value = {
    token,
    user,
    role,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
