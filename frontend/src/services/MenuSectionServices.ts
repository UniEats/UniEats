import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { BASE_API_URL } from "@/config/app-query-client";
import { MenuSectionCreateRequest, MenuSectionFormValues, MenuSectionSchema } from "@/models/MenuSection";
import { useAccessTokenGetter, useHandleResponse } from "@/services/TokenContext";

async function postMenuSection(
  data: MenuSectionCreateRequest,
  getAccessToken: () => Promise<string>,
  handleResponse: ReturnType<typeof useHandleResponse>,
) {
  const response = await fetch(`${BASE_API_URL}/menu-sections`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response, (json) => MenuSectionSchema.parse(json));
}

export async function deleteMenuSectionById(
  id: number,
  getAccessToken: () => Promise<string>,
  handleResponse: ReturnType<typeof useHandleResponse>,
) {
  const token = await getAccessToken();
  const response = await fetch(`${BASE_API_URL}/menu-sections/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 204) {
    return { message: "Menu section deleted successfully" } as const;
  }

  return handleResponse(response, async () => ({} as const));
}

export function useMenuSectionList() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();

  return useQuery({
    queryKey: ["menu-sections"],
    queryFn: async () => {
      const response = await fetch(`${BASE_API_URL}/menu-sections`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      });

      return handleResponse(response, (json) => MenuSectionSchema.array().parse(json));
    },
  });
}

export function useCreateMenuSection() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: MenuSectionFormValues) => {
      const payload: MenuSectionCreateRequest = {
        label: values.label,
        description: values.description,
      };

      return postMenuSection(payload, getAccessToken, handleResponse);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-sections"] });
    },
  });
}

export function useDeleteMenuSection() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteMenuSectionById(id, getAccessToken, handleResponse),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["menu-sections"] });
      const previous = queryClient.getQueryData<any[]>(["menu-sections"]);
      queryClient.setQueryData(["menu-sections"], (old: any[] | undefined) => (old ? old.filter((s) => s.id !== id) : old));
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(["menu-sections"], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-sections"] });
    },
  });
}

export function useUpdateMenuSection() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: number; values: MenuSectionFormValues }) => {
      const response = await fetch(`${BASE_API_URL}/menu-sections/${id}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: JSON.stringify({ label: values.label, description: values.description }),
      });

      if (response.ok) {
        const text = await response.text();
        if (!text) return null;
        return JSON.parse(text);
      }

      return handleResponse(response, (json) => MenuSectionSchema.parse(json));
    },
    onMutate: async ({ id, values }: { id: number; values: MenuSectionFormValues }) => {
      await queryClient.cancelQueries({ queryKey: ["menu-sections"] });
      const previous = queryClient.getQueryData<any[]>(["menu-sections"]);
      queryClient.setQueryData(["menu-sections"], (old: any[] | undefined) =>
        old ? old.map((s) => (s.id === id ? { ...s, label: values.label, description: values.description } : s)) : old,
      );
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(["menu-sections"], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-sections"] });
    },
  });
}