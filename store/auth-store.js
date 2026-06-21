"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearAdminToken, getAdminToken, setAdminToken } from "@/utils/localtoken";

function syncAuthFromCookie() {
  const token = getAdminToken();
  const state = useAuthStore.getState();

  if (token) {
    if (state.token !== token || !state.isAuthenticated) {
      state.setAuth({ user: state.user, token });
    }
    return;
  }

  if (state.isAuthenticated) {
    state.logout();
  }
}

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
          return { user, token, isAuthenticated: Boolean(token) };
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
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        const token = getAdminToken();
        if (token) {
          state?.setAuth({ user: state?.user ?? null, token });
        } else {
          state?.logout();
        }
        state?.setHydrated(true);
      },
    }
  )
);

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === "ka-auth-storage") {
      syncAuthFromCookie();
    }
  });

  window.addEventListener("focus", syncAuthFromCookie);
}
