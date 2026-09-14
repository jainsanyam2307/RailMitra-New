import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const USERS_KEY = "railmitra-users";
const SESSION_KEY = "railmitra-user";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJson(SESSION_KEY, null));

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  }, [user]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    register: ({ name, email, phone, password }) => {
      const users = readJson(USERS_KEY, []);
      const normalizedEmail = email.trim().toLowerCase();
      if (users.some((item) => item.email === normalizedEmail)) {
        return { ok: false, error: "An account with this email already exists." };
      }
      const account = { id: `USR-${Date.now()}`, name: name.trim(), email: normalizedEmail, phone: phone.trim(), password };
      saveUsers([...users, account]);
      const safeUser = { id: account.id, name: account.name, email: account.email, phone: account.phone };
      setUser(safeUser);
      return { ok: true, user: safeUser };
    },
    login: ({ email, password }) => {
      const users = readJson(USERS_KEY, []);
      const account = users.find((item) => item.email === email.trim().toLowerCase() && item.password === password);
      if (!account) return { ok: false, error: "Invalid email or password." };
      const safeUser = { id: account.id, name: account.name, email: account.email, phone: account.phone };
      setUser(safeUser);
      return { ok: true, user: safeUser };
    },
    updateProfile: ({ name, phone }) => {
      if (!user) return { ok: false, error: "You are not signed in." };
      const users = readJson(USERS_KEY, []);
      const updated = users.map((item) => item.id === user.id ? { ...item, name: name.trim(), phone: phone.trim() } : item);
      saveUsers(updated);
      const safeUser = { ...user, name: name.trim(), phone: phone.trim() };
      setUser(safeUser);
      return { ok: true, user: safeUser };
    },
    logout: () => setUser(null),
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
