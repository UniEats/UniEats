import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { BASE_API_URL } from "@/config/app-query-client";
import {
  ProductCreateRequest,
  ProductFormValues,
  ProductListSchema,
  ProductSchema,
  ProductUpdateFormValues,
  ProductUpdateRequest,
} from "@/models/Product";
import { useAccessTokenGetter, useHandleResponse } from "./TokenContext";

async function postProduct(
  data: ProductCreateRequest,
  getAccessToken: () => Promise<string>,
  handleResponse: ReturnType<typeof useHandleResponse>,
) {
  const token = await getAccessToken();

  const formData = new FormData();
  formData.append(
    "product",
    JSON.stringify({
      name: data.name,
      description: data.description,
      price: data.price,
      ingredientIds: data.ingredientIds,
      tagIds: data.tagIds,
      menuSectionIds: data.menuSectionIds,
    }),
  );
  formData.append("image", data.image);

  const response = await fetch(`${BASE_API_URL}/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return handleResponse(response, (json) => ProductSchema.parse(json));
}

async function patchProduct(
  id: number,
  data: ProductUpdateRequest,
  getAccessToken: () => Promise<string>,
  handleResponse: ReturnType<typeof useHandleResponse>,
) {
  const token = await getAccessToken();

  const formData = new FormData();
  formData.append(
    "product",
    JSON.stringify({
      name: data.name,
      description: data.description,
      price: data.price,
      ingredientIds: data.ingredientIds,
      tagIds: data.tagIds,
      menuSectionIds: data.menuSectionIds,
    }),
  );
  if (data.image) {
    formData.append("image", data.image);
  }

  const response = await fetch(`${BASE_API_URL}/products/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return handleResponse(response, (json) => ProductSchema.parse(json));
}

export async function deleteProductById(
  id: number,
  getAccessToken: () => Promise<string>,
  handleResponse: ReturnType<typeof useHandleResponse>,
) {
  const token = await getAccessToken();
  const response = await fetch(`${BASE_API_URL}/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 204) {
    return {"message": "Product deleted successfully"} as const;
  }

  return handleResponse(response, async () => ({} as const));
}

export function useProductList() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();

  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch(`${BASE_API_URL}/products`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      });

      return handleResponse(response, (json) => ProductListSchema.parse(json));
    },
  });
}

export function useDeleteProduct() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProductById(id, getAccessToken, handleResponse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["menu-sections"] });
    },
  });
}

export function useCreateProduct() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (!values.image) {
        throw new Error("Image is required");
      }

      const payload: ProductCreateRequest = {
        name: values.name,
        description: values.description,
        price: Number(values.price),
        ingredientIds: values.ingredientIds.map((id) => Number.parseInt(id, 10)),
        tagIds: values.tagIds.map((id) => Number.parseInt(id, 10)),
        menuSectionIds: values.menuSectionIds.map((id) => Number.parseInt(id, 10)),
        image: values.image,
      };

      return postProduct(payload, getAccessToken, handleResponse);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["menu-sections"] });
    },
  });
}

export function useUpdateProduct() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ProductUpdateFormValues) => {
      const productId = Number.parseInt(values.productId, 10);

      if (Number.isNaN(productId)) {
        throw new Error("Invalid product selected");
      }

      const payload: ProductUpdateRequest = {};

      if (values.name.trim().length > 0) {
        payload.name = values.name.trim();
      }

      if (values.description.trim().length > 0) {
        payload.description = values.description.trim();
      }

      if (values.price !== undefined) {
        payload.price = Number(values.price);
      }

      if (values.ingredientIds.length > 0) {
        payload.ingredientIds = values.ingredientIds.map((id) => Number.parseInt(id, 10));
      }

      if (values.tagIds.length > 0) {
        payload.tagIds = values.tagIds.map((id) => Number.parseInt(id, 10));
      } else {
        payload.tagIds = [];
      }

      if (values.menuSectionIds.length > 0) {
        payload.menuSectionIds = values.menuSectionIds.map((id) => Number.parseInt(id, 10));
      } else {
        payload.menuSectionIds = [];
      }

      if (values.image) {
        payload.image = values.image;
      }

      if (!payload.name && !payload.description && !payload.price && !payload.ingredientIds && !payload.tagIds && !payload.menuSectionIds && !payload.image) {
        throw new Error("Nothing to update");
      }

      return patchProduct(productId, payload, getAccessToken, handleResponse);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["menu-sections"] });
    },
  });
}
