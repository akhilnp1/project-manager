import { create } from "zustand";
import type { AuthUser } from "@/types";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");
    const raw = localStorage.getItem("user");
    if (token && raw) {
      try {
        const user = JSON.parse(raw) as AuthUser;
        set({ user, token });
      } catch {}
    }
  },

  setAuth: (user, token) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },
}));
