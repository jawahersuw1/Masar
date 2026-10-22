import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setApiUser, setUnauthorizedHandler } from '../lib/api.js';

const KEY = 'masar.user';
const AuthContext = createContext(null);

function readStoredUser() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}

// Demo sign-in: the backend identifies people by an id header (no password). See backend notes.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = readStoredUser();
    setApiUser(stored?.id ?? null);
    return stored;
  });

  const login = useCallback((u) => {
    setApiUser(u.id);
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    setApiUser(null);
    localStorage.removeItem(KEY);
    setUser(null);
  }, []);

  useEffect(() => { setUnauthorizedHandler(logout); }, [logout]);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);