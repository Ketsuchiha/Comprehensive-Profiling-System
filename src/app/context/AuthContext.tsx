import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('ccs_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Get stored users
    const users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    
    // Find user with matching credentials
    const foundUser = users.find(
      (u: any) => u.email === email && u.password === password
    );

    if (foundUser) {
      const userData = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
      };
      setUser(userData);
      localStorage.setItem('ccs_user', JSON.stringify(userData));
      return true;
    }
    
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    // Get existing users
    const users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    
    // Check if email already exists
    if (users.some((u: any) => u.email === email)) {
      return false;
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
    };

    users.push(newUser);
    localStorage.setItem('ccs_users', JSON.stringify(users));

    // Auto-login after registration
    const userData = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };
    setUser(userData);
    localStorage.setItem('ccs_user', JSON.stringify(userData));
    
    return true;
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
