"use client";

import { useCallback } from "react";
import { customAxios } from "@/utils/api";

export function useCrudMutation({ baseUrl, onSuccess, onError }) {
  const create = useCallback(
    async (data) => {
      try {
        const res = await customAxios.post(baseUrl, data);
        onSuccess?.(res.data, "create");
        return res.data;
      } catch (error) {
        onError?.(error, "create");
        throw error;
      }
    },
    [baseUrl, onSuccess, onError]
  );

  const update = useCallback(
    async (data) => {
      const id = data?.id || data?._id;
      if (!id) throw new Error("Missing ID for update");
      try {
        const res = await customAxios.put(`${baseUrl}/${id}`, data);
        onSuccess?.(res.data, "update");
        return res.data;
      } catch (error) {
        onError?.(error, "update");
        throw error;
      }
    },
    [baseUrl, onSuccess, onError]
  );

  const remove = useCallback(
    async (data) => {
      if (!data?._id) throw new Error("Missing ID for delete");
      try {
        const res = await customAxios.delete(`${baseUrl}/${data._id}`);
        onSuccess?.(res.data, "delete");
        return res.data;
      } catch (error) {
        onError?.(error, "delete");
        throw error;
      }
    },
    [baseUrl, onSuccess, onError]
  );

  const getById = useCallback(
    async (id) => {
      if (!id) throw new Error("getById called without id");
      try {
        const res = await customAxios.get(`${baseUrl}/${id}`);
        onSuccess?.(res.data, "get");
        return res.data;
      } catch (error) {
        onError?.(error, "get");
        throw error;
      }
    },
    [baseUrl, onSuccess, onError]
  );

  return { create, update, remove, getById };
}
