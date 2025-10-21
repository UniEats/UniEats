import { QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "./components/Cart/Cart";
import { Navigation } from "@/Navigation";
import { appQueryClient } from "@/config/app-query-client";
import { TokenProvider } from "@/services/TokenContext";

export function App() {
  return (
    <QueryClientProvider client={appQueryClient}>
      <TokenProvider>
        <CartProvider>
          <Navigation />
        </CartProvider>
      </TokenProvider>
    </QueryClientProvider>
  );
}
