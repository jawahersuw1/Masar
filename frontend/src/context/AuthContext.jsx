import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setApiToken, setUnauthorizedHandler } from '../lib/api.js';

const KEY = 'masar.session';
const AuthContext = createContext(null);

function readSession() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}

// A real session: signing up or signing in gives { token, user }. The token is sent with every request.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    localStorage.removeItem('masar.user'); // the old demo sign-in
    const stored = readSession();
    setApiToken(stored?.token ?? null);
    return stored;
  });

  const login = useCallback((s) => {
    setApiToken(s.token);
    localStorage.setItem(KEY, JSON.stringify(s));
    setSession(s);
  }, []);

  const clear = useCallback(() => {
    setApiToken(null);
    localStorage.removeItem(KEY);
    setSession(null);
  }, []);

  const logout = useCallback(async () => {
    try { await api.logout(); } catch { /* the session may already be over */ }
    clear();
  }, [clear]);

  // If the server says the session is over (401), sign out here too.
  useEffect(() => { setUnauthorizedHandler(clear); }, [clear]);

  // When the app opens with a saved session, ask the server once if it is still valid.
  useEffect(() => {
    if (readSession()?.token) api.me().catch(() => {});
  }, []);

  const value = useMemo(() => ({ user: session?.user ?? null, login, logout }), [session, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
