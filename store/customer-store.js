"use client";

import { create } from "zustand";

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
  limit: 15,
};

export const useCustomerStore = create((set) => ({
  ...initialState,
  setSearch: (search) => set({ search, offset: 0 }),
  setFilter: (key, value) => set({ [key]: value, offset: 0 }),
  setFilters: (filters) => set({ ...filters, offset: 0 }),
  setPagination: ({ offset, limit }) => set({ offset, limit }),
  resetFilters: () => set({ ...initialState }),
}));
