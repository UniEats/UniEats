import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { BASE_API_URL } from "@/config/app-query-client";
import { TagCreateRequest, TagFormValues, TagSchema, Tag } from "@/models/Tag";
import { useAccessTokenGetter, useHandleResponse } from "@/services/TokenContext";

async function postTag(
  data: TagCreateRequest,
  getAccessToken: () => Promise<string>,
  handleResponse: ReturnType<typeof useHandleResponse>,
) {
  const response = await fetch(`${BASE_API_URL}/tags`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response, (json) => TagSchema.parse(json));
}

export function useTagList() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();

  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await fetch(`${BASE_API_URL}/tags`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      });

      return handleResponse(response, (json) => TagSchema.array().parse(json));
    },
  });
}

export function useCreateTag() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: TagFormValues) => {
      const payload: TagCreateRequest = {
        tag: values.tag,
      };

      return postTag(payload, getAccessToken, handleResponse);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useUpdateTag() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: number; values: TagFormValues }) => {
      const response = await fetch(`${BASE_API_URL}/tags/${id}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: JSON.stringify({ tag: values.tag }),
      });

      if (response.ok) {
        // Some endpoints may return 204 or an empty body on success. Handle that safely.
        const text = await response.text();
        if (!text) return null;
        const json = JSON.parse(text);
        return TagSchema.parse(json);
      }

      return handleResponse(response, (json) => TagSchema.parse(json));
    },
    onMutate: async ({ id, values }: { id: number; values: TagFormValues }) => {
      await queryClient.cancelQueries({ queryKey: ["tags"] });
      const previous = queryClient.getQueryData<Tag[]>(["tags"]);
      queryClient.setQueryData(["tags"], (old: Tag[] | undefined) =>
        old ? old.map((t) => (t.id === id ? { ...t, tag: values.tag } : t)) : old,
      );
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tags"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useDeleteTag() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${BASE_API_URL}/tags/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      });

      // handle common success cases (204 No Content or 2xx with empty body)
      if (response.status === 204 || response.ok) {
        try {
          const text = await response.text();
          if (!text) return null;
          // if there is a body, return parsed value (not expected but safe)
          return JSON.parse(text) as null;
        } catch (e) {
          return e;
        }
      }

      return handleResponse(response, (json) => json as null);
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["tags"] });
      const previous = queryClient.getQueryData<Tag[]>(["tags"]);
      queryClient.setQueryData(["tags"], (old: Tag[] | undefined) => (old ? old.filter((t) => t.id !== id) : old));
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tags"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}
