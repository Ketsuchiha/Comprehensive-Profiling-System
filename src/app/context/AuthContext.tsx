import { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../utils/api';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  refId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('ccs_user');
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      localStorage.removeItem('ccs_user');
      return null;
    }
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await api.post<{ user: { user_id: number; username: string; user_type: string; ref_id: string; display_name?: string } }>('/auth/login', {
        username: email,
        password,
      });
      const userData: User = {
        id: String(data.user.user_id),
        email: data.user.username,
        name: data.user.display_name || data.user.username,
        role: data.user.user_type,
        refId: data.user.ref_id,
      };
      setUser(userData);
      localStorage.setItem('ccs_user', JSON.stringify(userData));
      return true;
    } catch {
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const data = await api.post<{ user: { user_id: number; username: string; user_type: string; ref_id: string } }>('/auth/register', {
        username: email,
        password,
        user_type: 'Admin',
      });
      const userData: User = {
        id: String(data.user.user_id),
        email: data.user.username,
        name: name,
        role: data.user.user_type,
        refId: data.user.ref_id,
      };
      setUser(userData);
      localStorage.setItem('ccs_user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      return { success: false, error: message };
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
