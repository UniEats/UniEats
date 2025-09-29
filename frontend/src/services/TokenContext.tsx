import React, { Dispatch, useCallback, useContext, useState } from "react";

import { AuthResponse, AuthResponseSchema } from "@/models/Login";

const TOKEN_STORAGE_KEY = "tokens";

type TokenContextData =
  | {
      state: "LOGGED_OUT";
    }
  | {
      state: "LOGGED_IN";
      tokens: AuthResponse;
    };

const TokenContext = React.createContext<[TokenContextData, Dispatch<TokenContextData>] | null>(null);

export const TokenProvider = ({ children }: React.PropsWithChildren) => {
  const [state, setInternalState] = useState<TokenContextData>(getInitialTokenState);
  const setState = useCallback(
    (state: TokenContextData) => {
      if (state.state === "LOGGED_IN") {
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(state.tokens));
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
      setInternalState(state);
    },
    [setInternalState],
  );
  return <TokenContext.Provider value={[state, setState]}>{children}</TokenContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useToken() {
  const context = useContext(TokenContext);
  if (context === null) {
    throw new Error("React tree should be wrapped in TokenProvider");
  }
  return context;
}

const getInitialTokenState = (): TokenContextData => {
  const storedData = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (storedData) {
    try {
      const tokens = AuthResponseSchema.parse(JSON.parse(storedData));
      return { state: "LOGGED_IN", tokens };
    } catch (err) {
      console.error(err);
    }
  }
  return { state: "LOGGED_OUT" };
};
