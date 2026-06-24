"use client";

import { create } from "zustand";
import { DEFAULT_PAGE_LIMIT } from "@/lib/constants";

const initialOrderView = {
  search: "",
  status: "all",
  payment_status: "all",
  shipping_status: "all",
  shipment_created_from: "",
  shipment_created_to: "",
  offset: 0,
  limit: DEFAULT_PAGE_LIMIT,
};

const createInitialViews = () => ({
  cod: { ...initialOrderView },
  online: { ...initialOrderView },
});

function updateOrderView(state, type, updates) {
  const currentView = state.orderViews[type] || initialOrderView;

  return {
    orderViews: {
      ...state.orderViews,
      [type]: {
        ...currentView,
        ...updates,
      },
    },
  };
}

export const useOrderStore = create((set) => ({
  orderViews: createInitialViews(),
  setSearch: (type, search) =>
    set((state) => updateOrderView(state, type, { search, offset: 0 })),
  setFilter: (type, key, value) =>
    set((state) => updateOrderView(state, type, { [key]: value, offset: 0 })),
  setFilters: (type, filters) =>
    set((state) => updateOrderView(state, type, { ...filters, offset: 0 })),
  setPagination: (type, { offset, limit }) =>
    set((state) => updateOrderView(state, type, { offset, limit })),
  resetOrderView: (type) =>
    set((state) =>
      type
        ? updateOrderView(state, type, { ...initialOrderView })
        : { orderViews: createInitialViews() }
    ),
}));
