import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { BASE_API_URL } from "@/config/app-query-client";
import {
  ComboCreateRequest,
  ComboFormValues,
  ComboListSchema,
  ComboSchema,
  ComboUpdateRequest
} from "@/models/Combo";
import { useAccessTokenGetter, useHandleResponse } from "./TokenContext";

async function postCombo(
  data: ComboCreateRequest,
  getAccessToken: () => Promise<string>,
  handleResponse: ReturnType<typeof useHandleResponse>,
) {
  const token = await getAccessToken();

  const formData = new FormData();
  formData.append(
    "combo",
    JSON.stringify({
      name: data.name,
      description: data.description,
      price: data.price,
      productIds: data.productIds,
      menuSectionIds: data.menuSectionIds,
    }),
  );
  formData.append("image", data.image);

  const response = await fetch(`${BASE_API_URL}/combos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
    });

  return handleResponse(response, (json) => ComboSchema.parse(json));
}

export async function patchCombo(
  id: number,
  data: ComboUpdateRequest,
  getAccessToken: () => Promise<string>,
  handleResponse: ReturnType<typeof useHandleResponse>,
) {
  const token = await getAccessToken();

  const formData = new FormData();
  formData.append(
      "combo",
      JSON.stringify({
          name: data.name,
          description: data.description,
          price: data.price,
          productIds: data.productIds,
          menuSectionIds: data.menuSectionIds,
      })
  );
  if(data.image) {
      formData.append("image", data.image)
  }

  const response = await fetch(`${BASE_API_URL}/combos/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return handleResponse(response, (json) => ComboSchema.parse(json));
}

export async function deleteComboById(
  id: number,
  getAccessToken: () => Promise<string>,
  handleResponse: ReturnType<typeof useHandleResponse>,
) {
  const token = await getAccessToken();
  const response = await fetch(`${BASE_API_URL}/combos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 204) {
    return { "message": "Combo deleted successfully" } as const;
  }

  return handleResponse(response, async () => ({} as const));
}

export function useComboList() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();

  return useQuery({
    queryKey: ["combos"],
    queryFn: async () => {
      const response = await fetch(`${BASE_API_URL}/combos`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      });

      return handleResponse(response, (json) => ComboListSchema.parse(json));
    },
  });
}

export function useDeleteCombo() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      deleteComboById(id, getAccessToken, handleResponse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["combos"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["menu-sections"] });
    },
  });
}

export function useCreateCombo() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ComboFormValues) => {
      if (!values.image) {
        throw new Error("Image is required");
      }

      const payload: ComboCreateRequest = {
        name: values.name,
        description: values.description,
        price: Number(values.price),
        productIds: values.productIds.map((p) => ({
          productId: Number(p.id),
          quantity: p.quantity
        })),
        menuSectionIds: values.menuSectionIds.map((id) => Number.parseInt(id, 10)),
        image: values.image,
      };

      return postCombo(payload, getAccessToken, handleResponse);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["combos"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["menu-sections"] });
    },
  });
}

export function useUpdateCombo() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ComboFormValues & { comboId: number }) => {
      const comboId = values.comboId;
      if (Number.isNaN(comboId)) {
        throw new Error("Invalid combo selected");
      }

      const payload: ComboUpdateRequest = {};

      if (values.name.trim().length > 0) {
        payload.name = values.name.trim();
      }

      if (values.description.trim().length > 0) {
        payload.description = values.description.trim();
      }

      if (values.price !== undefined) {
        payload.price = Number(values.price);
      }

      if (values.productIds.length > 0) {
        payload.productIds = values.productIds.map((p) => ({
          productId: Number.parseInt(p.id, 10),
          quantity: p.quantity
        }));
      }

      if (values.menuSectionIds.length > 0) {
        payload.menuSectionIds = values.menuSectionIds.map((id) => Number.parseInt(id, 10));
      } else {
        payload.menuSectionIds = [];
      }

      if (values.image) {
        payload.image = values.image;
      }

      if (!payload.name && !payload.description && !payload.price && !payload.productIds && !payload.menuSectionIds && !payload.image) {
        throw new Error("Nothing to update");
      }

      return patchCombo(comboId, payload, getAccessToken, handleResponse);

    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["combos"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["menu-sections"] });
    },
  });
}