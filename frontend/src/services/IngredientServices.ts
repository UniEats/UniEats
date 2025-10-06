import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { BASE_API_URL } from "@/config/app-query-client";
import { IngredientCreateRequest, IngredientFormValues, IngredientSchema } from "@/models/Ingredient";
import { useAccessTokenGetter, useHandleResponse } from "@/services/TokenContext";

async function postIngredient(
  data: IngredientCreateRequest,
  getAccessToken: () => Promise<string>,
  handleResponse: ReturnType<typeof useHandleResponse>,
) {
  const response = await fetch(`${BASE_API_URL}/ingredients`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response, (json) => IngredientSchema.parse(json));
}

export function useIngredientList() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();

  return useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const response = await fetch(`${BASE_API_URL}/ingredients`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      });

      return handleResponse(response, (json) => IngredientSchema.array().parse(json));
    },
  });
}

export function useCreateIngredient() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: IngredientFormValues) => {
      const payload: IngredientCreateRequest = {
        name: values.name,
        description: values.description,
        stock: Number.parseInt(values.stock, 10),
      };

      return postIngredient(payload, getAccessToken, handleResponse);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}
