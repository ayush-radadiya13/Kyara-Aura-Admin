"use client";

import { create } from "zustand";
import { DEFAULT_PAGE_LIMIT } from "@/lib/constants";

const initialFilters = {
  search: "",
  is_banned: "all",
  registered_from: "",
  registered_to: "",
  order_range: "all",
  min_orders: "",
  max_orders: "",
};

const initialState = {
  ...initialFilters,
  offset: 0,
  limit: DEFAULT_PAGE_LIMIT,
};

export const useCustomerStore = create((set) => ({
  ...initialState,
  setSearch: (search) => set({ search, offset: 0 }),
  setFilter: (key, value) => set({ [key]: value, offset: 0 }),
  setFilters: (filters) => set({ ...filters, offset: 0 }),
  setPagination: ({ offset, limit }) => set({ offset, limit }),
  resetFilters: () => set({ ...initialState }),
}));
