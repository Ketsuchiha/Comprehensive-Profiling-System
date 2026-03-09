import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../utils/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('ccs_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await api.post<{ user: { user_id: number; username: string; user_type: string; ref_id: string } }>('/auth/login', {
        username: email,
        password,
      });
      const userData: User = {
        id: String(data.user.user_id),
        email: data.user.username,
        name: data.user.username,
      };
      setUser(userData);
      localStorage.setItem('ccs_user', JSON.stringify(userData));
      return true;
    } catch {
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const data = await api.post<{ user: { user_id: number; username: string } }>('/auth/register', {
        username: email,
        password,
        user_type: 'Admin',
        ref_id: name,
      });
      const userData: User = {
        id: String(data.user.user_id),
        email: data.user.username,
        name: name,
      };
      setUser(userData);
      localStorage.setItem('ccs_user', JSON.stringify(userData));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ccs_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
