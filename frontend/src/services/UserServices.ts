import { useMutation, useQuery } from "@tanstack/react-query";

import { BASE_API_URL } from "@/config/app-query-client";
import { MessageResponseSchema, AuthResponseSchema, LoginRequest, SignupRequest, VerifyRequest } from "@/models/Login";
import { UserCountSchema } from "@/models/User";
import { useAccessTokenGetter, useHandleResponse, useToken } from "@/services/TokenContext";

export function useLogin() {
  const [, setToken] = useToken();

  return useMutation({
    mutationFn: async (req: LoginRequest) => {
      const tokens = await auth("POST", "/sessions", req);
      setToken({ state: "LOGGED_IN", tokens });
    },
  });
}

export function useRefresh() {
  const [tokenState, setToken] = useToken();

  return useMutation({
    mutationFn: async () => {
      if (tokenState.state !== "LOGGED_IN") {
        throw new Error("User is not logged in.");
      }

      const refreshToken = tokenState.tokens.refreshToken;
      const tokenPromise = auth("PUT", "/sessions", { refreshToken });

      setToken({ state: "REFRESHING", tokenPromise });
      return tokenPromise;
    },
    onSuccess: (data) => {
      setToken({ state: "LOGGED_IN", tokens: data });
    },
    // 4. Handle error: This runs if the tokenPromise rejects.
    onError: () => {
      setToken({ state: "LOGGED_OUT" });
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      const response = await fetch(BASE_API_URL + "/users/register", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return MessageResponseSchema.parse(await response.json());
    },
  });
}

export function useVerify() {
  return useMutation({
    mutationFn: async (data: VerifyRequest) => {
      const response = await fetch(BASE_API_URL + "/users/verify", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Error verificando el código");
      }

      return MessageResponseSchema.parse(json);
    },
  });
}

async function auth(method: "PUT" | "POST", endpoint: string, data: object) {
  const response = await fetch(BASE_API_URL + endpoint, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    return AuthResponseSchema.parse(await response.json());
  } else {
    throw new Error(`Failed with status ${response.status}: ${await response.text()}`);
  }
}

export function useUserCount() {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();

  return useQuery({
    queryKey: ["users", "count"],
    queryFn: async () => {
      const response = await fetch(`${BASE_API_URL}/users/count`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      });

      return handleResponse(response, (json) => UserCountSchema.parse(json));
    },
  });
}
