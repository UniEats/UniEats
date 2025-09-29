import { useMutation } from "@tanstack/react-query";

import { BASE_API_URL } from "@/config/app-query-client";
import { AuthResponseSchema, LoginRequest, SignupRequest } from "@/models/Login";
import { useToken } from "@/services/TokenContext";

export function useLogin() {
  const [, setToken] = useToken();

  return useMutation({
    mutationFn: async (req: LoginRequest) => {
      const tokens = await auth("/sessions", req);
      setToken({ state: "LOGGED_IN", tokens });
    },
  });
}

export function useSignup() {
  const [, setToken] = useToken();

  return useMutation({
    mutationFn: async (req: SignupRequest) => {
      const tokens = await auth("/users", req);
      setToken({ state: "LOGGED_IN", tokens });
    },
  });
}

async function auth(endpoint: string, data: LoginRequest | SignupRequest) {
  const response = await fetch(BASE_API_URL + endpoint, {
    method: "POST",
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
