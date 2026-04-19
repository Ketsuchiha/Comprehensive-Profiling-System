import { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../utils/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  refId: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (changes: Partial<User>) => void;
}

const STORAGE_KEY = 'ccs_student_user';
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const data = await api.post<{ user: { user_id: number; user_type: string; username: string; ref_id: string; display_name?: string } }>(
        '/auth/login',
        { username: normalizedEmail, password }
      );

      if (data.user.user_type !== 'Student') {
        return { success: false, error: 'This portal is for student accounts only.' };
      }

      const loggedInUser: User = {
        id: String(data.user.user_id),
        email: data.user.username,
        name: data.user.display_name || data.user.username,
        role: data.user.user_type,
        refId: data.user.ref_id,
      };
      setUser(loggedInUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateUser = (changes: Partial<User>) => {
    setUser((previous) => {
      if (!previous) return previous;
      const nextUser = { ...previous, ...changes };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
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
