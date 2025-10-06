import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { BASE_API_URL } from "@/config/app-query-client";
import { TagCreateRequest, TagFormValues, TagSchema } from "@/models/Tag";
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
