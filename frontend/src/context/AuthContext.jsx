import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount using the demoLoggedIn flag
  useEffect(() => {
    try {
      const demoLoggedIn = localStorage.getItem('demoLoggedIn') === 'true';
      if (demoLoggedIn) {
        const stored = localStorage.getItem('demoUser');
        const parsed = stored ? JSON.parse(stored) : { fullName: 'Demo User', email: '', role: 'STUDENT' };
        setUser(parsed);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Demo login — no network request.
   * Accepts any valid email format + any non-empty password.
   */
  const login = (email, _password) => {
    const demoUser = { fullName: 'Demo User', email, role: 'STUDENT' };
    localStorage.setItem('demoLoggedIn', 'true');
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    setUser(demoUser);
    return demoUser;
  };

  /**
   * Register — demo-only path, mirrors login behaviour.
   */
  const register = (fullName, email, _password) => {
    const demoUser = { fullName, email, role: 'STUDENT' };
    localStorage.setItem('demoLoggedIn', 'true');
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    setUser(demoUser);
    return demoUser;
  };

  /** Logout clears all demo state and redirects to /login. */
  const logout = () => {
    localStorage.removeItem('demoLoggedIn');
    localStorage.removeItem('demoUser');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, setLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
