import { create } from "zustand";

export interface AuthStore {
  isLoggedIn: boolean;
  user: {
    name: string;
    avatar: string;
    profileUrl: string;
  } | null;
  login: (user: { name: string; avatar: string; profileUrl: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLoggedIn: false,
  user: null,
  login: (user) => set({ isLoggedIn: true, user }),
  logout: () => set({ isLoggedIn: false, user: null }),
}));
