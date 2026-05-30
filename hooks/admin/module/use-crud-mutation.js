"use client";

import { useCallback, useEffect, useRef } from "react";
import { customAxios } from "@/utils/api";

export function useCrudMutation({ baseUrl, onSuccess, onError }) {
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const create = useCallback(
    async (data) => {
      try {
        const res = await customAxios.post(baseUrl, data);
        onSuccessRef.current?.(res.data, "create");
        return res.data;
      } catch (error) {
        onErrorRef.current?.(error, "create");
        throw error;
      }
    },
    [baseUrl]
  );

  const update = useCallback(
    async (data) => {
      const id =
        data instanceof FormData
          ? data.get("id") || data.get("_id") || data.get("edit_value")
          : data?.id || data?._id || data?.edit_value;
      if (!id) throw new Error("Missing ID for update");
      try {
        const res = await customAxios.put(`${baseUrl}/${id}`, data);
        onSuccessRef.current?.(res.data, "update");
        return res.data;
      } catch (error) {
        onErrorRef.current?.(error, "update");
        throw error;
      }
    },
    [baseUrl]
  );

  const remove = useCallback(
    async (data) => {
      if (!data?._id) throw new Error("Missing ID for delete");
      try {
        const res = await customAxios.delete(`${baseUrl}/${data._id}`);
        onSuccessRef.current?.(res.data, "delete");
        return res.data;
      } catch (error) {
        onErrorRef.current?.(error, "delete");
        throw error;
      }
    },
    [baseUrl]
  );

  const getById = useCallback(
    async (id) => {
      if (!id) throw new Error("getById called without id");
      try {
        const res = await customAxios.get(`${baseUrl}/${id}`);
        onSuccessRef.current?.(res.data, "get");
        return res.data;
      } catch (error) {
        onErrorRef.current?.(error, "get");
        throw error;
      }
    },
    [baseUrl]
  );

  return { create, update, remove, getById };
}
