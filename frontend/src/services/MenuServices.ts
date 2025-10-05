import { useQuery } from "@tanstack/react-query";

import { BASE_API_URL } from "@/config/app-query-client";

import { Menu, MenuSchema } from "../models/Menu";
import { useAccessTokenGetter, useHandleResponse } from "./TokenContext";

export function useMenuList() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();

  return useQuery({
    queryKey: ["menus"],
    queryFn: async (): Promise<Menu> => {
      const response = await fetch(BASE_API_URL + "/menus", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      });

      return handleResponse(response, (json) => MenuSchema.parse(json));
    },
  });
}
