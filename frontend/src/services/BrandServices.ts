import { useMutation, useQuery } from "@tanstack/react-query";

import { BASE_API_URL } from "@/config/app-query-client";

import { Brand, BrandCreateRequest, BrandSchema } from "../models/Brand";
import { useToken } from "./TokenContext";

export function useBrandList() {
  const [tokenState] = useToken();
  if (tokenState.state !== "LOGGED_IN") {
    throw new Error("Auth needed for service");
  }

  return useQuery({
    queryKey: ["brands"],
    queryFn: async (): Promise<Brand[]> => {
      const response = await fetch(BASE_API_URL + "/brands", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${tokenState.tokens.accessToken}`,
        },
      });
      return BrandSchema.array().parse(await response.json());
    },
  });
}

export function useBrand(id: string) {
  const [tokenState] = useToken();
  if (tokenState.state !== "LOGGED_IN") {
    throw new Error("Auth needed for service");
  }

  return useQuery({
    queryKey: ["brand", id],
    queryFn: async (): Promise<Brand> => {
      const response = await fetch(`${BASE_API_URL}/brands/${id}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${tokenState.tokens.accessToken}`,
        },
      });
      return BrandSchema.parse(await response.json());
    },
  });
}

export function useBrandCreate() {
  const [tokenState] = useToken();
  if (tokenState.state !== "LOGGED_IN") {
    throw new Error("Auth needed for service");
  }

  return useMutation({
    mutationFn: async (data: BrandCreateRequest): Promise<Brand> => {
      const response = await fetch(`${BASE_API_URL}/brands`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${tokenState.tokens.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        return BrandSchema.parse(await response.json());
      } else {
        throw new Error(`Failed with status ${response.status}: ${await response.text()}`);
      }
    },
  });
}
