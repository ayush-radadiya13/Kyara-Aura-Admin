"use client";

import { create } from "zustand";

const initialState = {
  search: "",
  isActiveFilter: "all",
  offset: 0,
  limit: 10,
};

export const useProductStore = create((set) => ({
  ...initialState,
  setSearch: (search) => set({ search, offset: 0 }),
  setIsActiveFilter: (isActiveFilter) => set({ isActiveFilter, offset: 0 }),
  setPagination: ({ offset, limit }) => set({ offset, limit }),
  resetProductView: () => set({ ...initialState }),
}));
