import { useMutation, useQueryClient } from "@tanstack/react-query";

import { BASE_API_URL } from "@/config/app-query-client";
import { ProductCreateRequest, ProductFormValues, ProductSchema } from "@/models/Product";
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

export async function deleteProductById(
  id: number, 
  getAccessToken: () => Promise<string>, 
  handleResponse: ReturnType<typeof useHandleResponse>
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

export function useDeleteProduct() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProductById(id, getAccessToken, handleResponse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
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
        image: values.image,
      };

      return postProduct(payload, getAccessToken, handleResponse);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
