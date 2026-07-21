import { create } from "zustand";

export interface AuthStore {
  isLoggedIn: boolean;
  isAuthReady: boolean;
  user: {
    name: string;
    avatar: string;
    profileUrl: string;
  } | null;
  accessToken: string | null;
  login: (
    user: { name: string; avatar: string; profileUrl: string },
    accessToken: string
  ) => void;
  logout: () => void;
  setAuthReady: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLoggedIn: false,
  isAuthReady: false,
  user: null,
  accessToken: null,
  login: (user, accessToken) => set({ isLoggedIn: true, user, accessToken, isAuthReady: true }),
  logout: () => set({ isLoggedIn: false, user: null, accessToken: null, isAuthReady: true }),
  setAuthReady: () => set({ isAuthReady: true }),
}));
