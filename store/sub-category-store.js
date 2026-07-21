"use client";

import { create } from "zustand";
import { DEFAULT_PAGE_LIMIT } from "@/lib/constants";

const initialState = {
  search: "",
  offset: 0,
  limit: DEFAULT_PAGE_LIMIT,
};

export const useSubCategoryStore = create((set) => ({
  ...initialState,
  setSearch: (search) => set({ search, offset: 0 }),
  setPagination: ({ offset, limit }) => set({ offset, limit }),
  resetSubCategoryView: () => set({ ...initialState }),
}));
