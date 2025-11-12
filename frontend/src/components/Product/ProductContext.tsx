import { ReactNode, createContext, useContext, useState } from "react";

export type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  tags?: Record<number, string>;
  image?: Uint8Array;
  available: boolean;
};

type ProductsContextType = {
  productsMap: Record<number, MenuItem>;
  combosMap: Record<number, MenuItem>;
  setProducts: (products: MenuItem[]) => void;
  setCombos: (combos: MenuItem[]) => void;
};

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [productsMap, setProductsMap] = useState<Record<number, MenuItem>>({});
  const [combosMap, setCombosMap] = useState<Record<number, MenuItem>>({});

  const setProducts = (products: MenuItem[]) => {
    const map: Record<number, MenuItem> = {};
    products.forEach((p) => (map[p.id] = { ...p, available: p.available ?? false }));
    setProductsMap(map);
  };

  const setCombos = (combos: MenuItem[]) => {
    const map: Record<number, MenuItem> = {};
    combos.forEach((c) => (map[c.id] = { ...c, available: c.available ?? false }));
    setCombosMap(map);
  };

  return (
    <ProductsContext.Provider value={{ productsMap, combosMap, setProducts, setCombos }}>
      {children}
    </ProductsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) throw new Error("useProducts must be used within a ProductsProvider");
  return context;
};
