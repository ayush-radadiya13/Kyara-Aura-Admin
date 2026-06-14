"use client";

import { create } from "zustand";

export const useSidebarStore = create((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  setCollapsed: (isCollapsed) => set({ isCollapsed }),
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  toggleMobileSidebar: () =>
    set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  setMobileOpen: (isMobileOpen) => set({ isMobileOpen }),
}));
