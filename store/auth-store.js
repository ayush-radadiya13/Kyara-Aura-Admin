"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearAdminToken, setAdminToken } from "@/utils/localtoken";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      setAuth: ({ user, token }) =>
        set(() => {
          setAdminToken(token);
          return { user, token, isAuthenticated: true };
        }),
      logout: () =>
        set(() => {
          clearAdminToken();
          return { user: null, token: null, isAuthenticated: false };
        }),
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: "ka-auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setAdminToken(state.token);
        } else {
          clearAdminToken();
        }

        state?.setHydrated(true);
      },
    }
  )
);
