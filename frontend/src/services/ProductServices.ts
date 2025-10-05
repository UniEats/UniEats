import { BASE_API_URL } from "@/config/app-query-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccessTokenGetter, useHandleResponse } from "./TokenContext";

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
