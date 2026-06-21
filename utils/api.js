"use client";

import axios from "axios";
import { useAuthStore } from "@/store/auth-store";
import { clearAdminToken, getAdminToken } from "@/utils/localtoken";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://kayraaura.up.railway.app";

function handleUnauthorized(requestUrl = "") {
  if (typeof window === "undefined") return;
  if (requestUrl.includes("login")) return;
  if (window.location.pathname === "/login") return;

  clearAdminToken();
  useAuthStore.getState().logout();
  window.location.assign("/login");
}

export const customAxios = axios.create({
  baseURL: API_BASE,
});

customAxios.interceptors.request.use(
  (config) => {
    const token = getAdminToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

customAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      handleUnauthorized(error.config?.url || "");
    }
    return Promise.reject(error);
  }
);

export const withoutTokenApi = axios.create({
  baseURL: API_BASE,
});
