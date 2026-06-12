"use client";

import { create } from "zustand";

const initialState = {
  search: "",
  offset: 0,
  limit: 10,
};

export const useOrderStore = create((set) => ({
  ...initialState,
  setSearch: (search) => set({ search, offset: 0 }),
  setPagination: ({ offset, limit }) => set({ offset, limit }),
  resetOrderView: () => set({ ...initialState }),
}));
