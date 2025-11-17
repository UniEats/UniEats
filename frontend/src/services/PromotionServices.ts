import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { BASE_API_URL } from "@/config/app-query-client";
import {
  PromotionCreateRequest,
  PromotionListSchema,
  PromotionSchema,
  PromotionUpdateRequest,
} from "@/models/Promotion";
import { useAccessTokenGetter, useHandleResponse } from "./TokenContext";

async function postPromotion(
  data: PromotionCreateRequest,
  getAccessToken: () => Promise<string>,
  handleResponse: ReturnType<typeof useHandleResponse>,
) {
  const token = await getAccessToken();

  const response = await fetch(`${BASE_API_URL}/promotions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    });

  return handleResponse(response, (json) => PromotionSchema.parse(json));
}

export async function patchPromotion(
  id: number,
  data: PromotionUpdateRequest,
  getAccessToken: () => Promise<string>,
  handleResponse: ReturnType<typeof useHandleResponse>,
) {
  const token = await getAccessToken();

  const response = await fetch(`${BASE_API_URL}/promotions/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response, (json) => PromotionSchema.parse(json));
}

export async function deletePromotionById(
  id: number,
  getAccessToken: () => Promise<string>,
  handleResponse: ReturnType<typeof useHandleResponse>,
) {
  const token = await getAccessToken();
  const response = await fetch(`${BASE_API_URL}/promotions/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 204) {
    return { "message": "Promotion deleted successfully" } as const;
  }

  return handleResponse(response, async () => ({} as const));
}

export function usePromotionList() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();

  return useQuery({
    queryKey: ["promotions"],
    queryFn: async () => {
      const response = await fetch(`${BASE_API_URL}/promotions`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      });

      return handleResponse(response, (json) => PromotionListSchema.parse(json));
    },
  });
}

export function useDeletePromotion() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      deletePromotionById(id, getAccessToken, handleResponse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}

export function useCreatePromotion() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: PromotionCreateRequest) => {
      return postPromotion(values, getAccessToken, handleResponse);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}

export function useUpdatePromotion() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { id: number; payload: PromotionUpdateRequest }) => {
      if (!variables.id) {
        throw new Error("Invalid promotion ID");
      }
      return patchPromotion(variables.id, variables.payload, getAccessToken, handleResponse);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}