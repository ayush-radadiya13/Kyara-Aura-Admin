"use client";

import { create } from "zustand";

const initialState = {
  search: "",
  isActiveFilter: "all",
  offset: 0,
  limit: 10,
  dialogOpen: false,
  editingId: null,
};

export const useCategoryStore = create((set) => ({
  ...initialState,
  setSearch: (search) => set({ search, offset: 0 }),
  setIsActiveFilter: (isActiveFilter) => set({ isActiveFilter, offset: 0 }),
  setPagination: ({ offset, limit }) => set({ offset, limit }),
  openCreateDialog: () => set({ dialogOpen: true, editingId: null }),
  openEditDialog: (editingId) => set({ dialogOpen: true, editingId }),
  closeDialog: () => set({ dialogOpen: false, editingId: null }),
  resetCategoryView: () => set({ ...initialState }),
}));
