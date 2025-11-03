import { Combo } from "@/models/Combo";
import { createContext, useContext, useState, ReactNode } from "react";

export type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  tags?: Record<number, string>;
  image?: Uint8Array;
  available?: boolean;
};

type ProductsContextType = {
  productsMap: Record<number, MenuItem>;
  combosMap: Record<number, Combo>;
  setProducts: (products: MenuItem[]) => void;
  setCombos: (combos: Combo[]) => void;

};

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [productsMap, setProductsMap] = useState<Record<number, MenuItem>>({});
  const [combosMap, setCombosMap] = useState<Record<number, Combo>>({});
  
  const setProducts = (products: MenuItem[]) => {
    const map: Record<number, MenuItem> = {};
    products.forEach((p) => (map[p.id] = p));
    setProductsMap(map);
  };

  const setCombos = (combos: Combo[]) => {
    const map: Record<number, Combo> = {};
    combos.forEach((c) => (map[c.id] = c));
    setCombosMap(map);
  };

  return (
    <ProductsContext.Provider value={{ productsMap, combosMap, setProducts, setCombos }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) throw new Error("useProducts must be used within a ProductsProvider");
  return context;
};
