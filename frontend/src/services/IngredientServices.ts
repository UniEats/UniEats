import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { BASE_API_URL } from "@/config/app-query-client";
import { IngredientCreateRequest, IngredientCreateFormValues, IngredientSchema, Ingredient, /*IngredientUpdateFormSchema,*/ IngredientUpdateFormValues } from "@/models/Ingredient";
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
    mutationFn: async (values: IngredientCreateFormValues) => {
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

export function useUpdateIngredient() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: number; values: IngredientUpdateFormValues }) => {
      const response = await fetch(`${BASE_API_URL}/ingredients/${id}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: JSON.stringify({ name: values.name, description: values.description }),
      });

      if (response.ok) {
        const text = await response.text();
        if (!text) return null;
        return JSON.parse(text);
      }

      return handleResponse(response, (json) => IngredientSchema.parse(json));
    },
    onMutate: async ({ id, values }: { id: number; values: IngredientUpdateFormValues }) => {
      await queryClient.cancelQueries({ queryKey: ["ingredients"] });
      const previous = queryClient.getQueryData<Ingredient[]>(["ingredients"]);
      queryClient.setQueryData(["ingredients"], (old: Ingredient[] | undefined) =>
        old ? old.map((i) => (i.id === id ? { ...i, name: values.name, description: values.description } : i)) : old,
      );
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(["ingredients"], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}

export function useDeleteIngredient() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${BASE_API_URL}/ingredients/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      });

      if (response.status === 204 || response.ok) return null;

      return handleResponse(response, (json) => json as null);
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["ingredients"] });
      const previous = queryClient.getQueryData<Ingredient[]>(["ingredients"]);
      queryClient.setQueryData(["ingredients"], (old: Ingredient[] | undefined) => (old ? old.filter((i) => i.id !== id) : old));
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(["ingredients"], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}

export function useIncreaseStockIngredient() {
  const getAccessToken = useAccessTokenGetter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, amount }: { id: number; amount: number }) => {
      const response = await fetch(`${BASE_API_URL}/ingredients/${id}/stock?amount=${amount}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      });

      if (response.ok) {
        const text = await response.text();
        if (!text) return null;
        return JSON.parse(text);
      }

      throw new Error("Error increasing stock");
    },
    onMutate: async ({ id, amount }) => {
      await queryClient.cancelQueries({ queryKey: ["ingredients"] });
      const previous = queryClient.getQueryData<Ingredient[]>(["ingredients"]);
      queryClient.setQueryData(["ingredients"], (old: Ingredient[] | undefined) =>
        old
          ? old.map((ingredient) =>
              ingredient.id === id
                ? { ...ingredient, stock: (ingredient.stock ?? 0) + amount }
                : ingredient
            )
          : old
      );
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(["ingredients"], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}
