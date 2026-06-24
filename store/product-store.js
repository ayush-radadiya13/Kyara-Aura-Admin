"use client";

import { create } from "zustand";
import { DEFAULT_PAGE_LIMIT } from "@/lib/constants";

const initialFilters = {
  search: "",
  category_id: "all",
  size_id: "all",
  min_price: "",
  max_price: "",
  is_active: "all",
  is_collection: "all",
};

const initialState = {
  ...initialFilters,
  offset: 0,
  limit: DEFAULT_PAGE_LIMIT,
};

export const useProductStore = create((set) => ({
  ...initialState,
  setSearch: (search) => set({ search, offset: 0 }),
  setFilter: (key, value) => set({ [key]: value, offset: 0 }),
  setFilters: (filters) => set({ ...filters, offset: 0 }),
  setPagination: ({ offset, limit }) => set({ offset, limit }),
  resetFilters: () => set({ ...initialState }),
}));
