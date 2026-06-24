"use client";

import { create } from "zustand";
import { DEFAULT_PAGE_LIMIT } from "@/lib/constants";

const initialReturnOrderView = {
  search: "",
  status: "all",
  offset: 0,
  limit: DEFAULT_PAGE_LIMIT,
};

const createInitialViews = () => ({
  cod: { ...initialReturnOrderView },
  online: { ...initialReturnOrderView },
});

function updateReturnOrderView(state, type, updates) {
  const currentView = state.returnOrderViews[type] || initialReturnOrderView;

  return {
    returnOrderViews: {
      ...state.returnOrderViews,
      [type]: {
        ...currentView,
        ...updates,
      },
    },
  };
}

export const useReturnOrderStore = create((set) => ({
  returnOrderViews: createInitialViews(),
  setSearch: (type, search) =>
    set((state) => updateReturnOrderView(state, type, { search, offset: 0 })),
  setFilter: (type, key, value) =>
    set((state) => updateReturnOrderView(state, type, { [key]: value, offset: 0 })),
  setFilters: (type, filters) =>
    set((state) => updateReturnOrderView(state, type, { ...filters, offset: 0 })),
  setPagination: (type, { offset, limit }) =>
    set((state) => updateReturnOrderView(state, type, { offset, limit })),
  resetReturnOrderView: (type) =>
    set((state) =>
      type
        ? updateReturnOrderView(state, type, { ...initialReturnOrderView })
        : { returnOrderViews: createInitialViews() }
    ),
}));
