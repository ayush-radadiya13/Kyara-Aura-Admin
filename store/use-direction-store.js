"use client";

import { create } from "zustand";

export const useDirectionStore = create((set) => ({
  direction: "ltr",
  toggleDirection: () =>
    set((state) => ({ direction: state.direction === "ltr" ? "rtl" : "ltr" })),
}));
