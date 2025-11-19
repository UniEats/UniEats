import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { BASE_API_URL } from "@/config/app-query-client";
import {
  PromotionCreateRequest,
  PromotionListSchema,
  PromotionSchema,
  PromotionUpdateRequest,
  normalizePromotion,
  NormalizedPromotion,
  PromotionUpdateFormValues
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
      'Content-Type': 'application/json',
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

export function useActivePromotionList() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();

  return useQuery<NormalizedPromotion[]>({
    queryKey: ["promotions"],
    queryFn: async () => {
      const response = await fetch(`${BASE_API_URL}/promotions/active`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      });

      return handleResponse(response, (json) => {
        const parsed = PromotionListSchema.parse(json);
        return parsed.map(normalizePromotion);
      });
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
    mutationFn: async (values: PromotionUpdateFormValues) => {
      const promotionId = Number(values.promotionId);

      if (Number.isNaN(promotionId) || promotionId <= 0) {
        throw new Error("Invalid promotion selected");
      }

      let payload: PromotionUpdateRequest;

      const basePayload = {
        ...(values.name && { name: values.name.trim() }),
        ...(values.description && { description: values.description.trim() }),
        ...(values.active !== undefined && { active: values.active }),
        ...(values.productIds && { productIds: values.productIds }),
        ...(values.comboIds && { comboIds: values.comboIds }),
        ...(values.validDays && { validDays: values.validDays }),
      };

      switch (values.type) {
        case "buyxpayy":
          payload = {
            ...basePayload,
            type: "buyxpayy",
            ...(values.buyQuantity !== undefined && { buyQuantity: Number(values.buyQuantity) }),
            ...(values.payQuantity !== undefined && { payQuantity: Number(values.payQuantity) }),
          };
          break;

        case "percentage":
          payload = {
            ...basePayload,
            type: "percentage",
            ...(values.percentage !== undefined && { percentage: Number(values.percentage) }),
          };
          break;

        case "threshold":
          payload = {
            ...basePayload,
            type: "threshold",
            ...(values.threshold !== undefined && { threshold: Number(values.threshold) }),
            ...(values.discountAmount !== undefined && { discountAmount: Number(values.discountAmount) }),
          };
          break;

        case "buygivefree":
          payload = {
            ...basePayload,
            type: "buygivefree",
            ...(values.freeProductIds && { freeProductIds: values.freeProductIds }),
            ...(values.freeComboIds && { freeComboIds: values.freeComboIds }),
            ...(values.oneFreePerTrigger !== undefined && { oneFreePerTrigger: values.oneFreePerTrigger }),
          };
          break;

        default:
          throw new Error("Invalid promotion type");
      }

      if (Object.keys(payload).length <= 1) {
          throw new Error("Nothing to update");
      }

      return patchPromotion(promotionId, payload, getAccessToken, handleResponse);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}