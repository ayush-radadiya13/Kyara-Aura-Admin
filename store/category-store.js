"use client";

import { create } from "zustand";
import {
  createCategoryService,
  deleteCategoryService,
  getCategoriesService,
  updateCategoryService,
} from "@/services/category-service";

export const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  actionLoading: false,
  fetchCategories: async () => {
    set({ loading: true });
    try {
      const data = await getCategoriesService();
      set({ categories: data.data || [] });
    } finally {
      set({ loading: false });
    }
  },
  addCategory: async (payload) => {
    set({ actionLoading: true });
    try {
      const data = await createCategoryService(payload);
      set({ categories: [data.data, ...get().categories] });
    } finally {
      set({ actionLoading: false });
    }
  },
  updateCategory: async (id, payload) => {
    set({ actionLoading: true });
    try {
      const data = await updateCategoryService(id, payload);
      set({
        categories: get().categories.map((item) =>
          item.id === id ? data.data : item
        ),
      });
    } finally {
      set({ actionLoading: false });
    }
  },
  removeCategory: async (id) => {
    set({ actionLoading: true });
    try {
      await deleteCategoryService(id);
      set({ categories: get().categories.filter((item) => item.id !== id) });
    } finally {
      set({ actionLoading: false });
    }
  },
}));
