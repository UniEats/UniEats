import { useMutation } from "@tanstack/react-query";
import { BASE_API_URL } from "@/config/app-query-client";
import { MessageResponseSchema } from "@/models/Login";
import { RequestResetRequest, ResetPasswordRequest } from "@/models/PasswordReset";


export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (data: RequestResetRequest) => {
      const response = await fetch(BASE_API_URL + "/users/password-reset/request", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Error requesting password recovery");
      }

      return json;
    },
  });
}


export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      const response = await fetch(BASE_API_URL + "/users/password-reset/reset", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Error resetting password");
      }

      return MessageResponseSchema.parse(json);
    },
  });
}