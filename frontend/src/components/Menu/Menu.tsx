import { useEffect, useMemo, useRef, useState } from "react";
import { useDeleteProduct } from "@/services/ProductServices";
import { useCart } from "@/components/Cart/Cart";
import Product from "../Product/Product";
import "./Menu.css";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  tags?: Record<number, string> | undefined;
  image?: Uint8Array;
};

type MenuSection = {
  id: number;
  label: string;
  description: string;
  products: MenuItem[];
};

type MenuProps = {
  menuSections: MenuSection[];
};

export const Menu = ({ menuSections }: MenuProps) => {
  const [activeCategoryId, setActiveCategoryId] = useState<MenuSection["id"] | null>(
    menuSections.length > 0 ? menuSections[0].id : null
  );

  const [isSwitching, setIsSwitching] = useState(false);
  const switchingRef = useRef(false);

  const deleteProduct = useDeleteProduct();

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting product", error);
      alert("The product could not be deleted");
    }
  };

  const handleCategoryClick = (id: number) => {
    if (switchingRef.current || id === activeCategoryId) return;

    switchingRef.current = true;
    setIsSwitching(true);
    setActiveCategoryId(id);

    setTimeout(() => {
      switchingRef.current = false;
      setIsSwitching(false);
    }, 300);
  };

  const { addToCart } = useCart();

  const handleAddToCart = (id: number, quantity: number) => {
    addToCart(id, quantity);
    alert(`Added ${quantity} of product ${id} to cart`);
  };

  useEffect(() => {
    if (!menuSections || menuSections.length === 0) {
      setActiveCategoryId(null);
      return;
    }
    setActiveCategoryId((prev) => {
      if (prev && menuSections.some((s) => s.id === prev)) return prev;
      return menuSections[0].id;
    });
  }, [menuSections]);

  const activeSection = useMemo(() => {
    if (!menuSections || menuSections.length === 0) return undefined;
    return menuSections.find((section) => section.id === activeCategoryId) ?? menuSections[0];
  }, [activeCategoryId, menuSections]);

  return (
    <div className="menu-page">
      <nav className="menu-categories" aria-label="Menu sections">
        <ul role="tablist">
          {menuSections.length === 0 ? (
            <p>No menu sections available</p>
          ) : (
            menuSections.map((section) => {
              if (section.products.length === 0) return null; 
              const isActive = section.id === activeCategoryId;
              return (
                <li key={section.id} role="presentation">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="menu-section"
                    className={`menu-category ${isActive ? "active" : ""}`}
                    onClick={() => handleCategoryClick(section.id)}
                    disabled={isSwitching}
                  >
                    {section.label}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </nav>

      <main id="menu-section">
        {activeSection && activeSection.products.length > 0 ? (
          <>
            <section className="menu-hero">
              <h1>{activeSection.label}</h1>
              <p>{activeSection.description}</p>
            </section>

            <section className="menu-grid-section">
              <div className="menu-grid">
                {activeSection.products.map((item) => (
                  <Product
                    key={item.id}
                    id={item.id}
                    image={item.image}
                    title={item.name}
                    description={item.description}
                    price={item.price}
                    tags={item.tags ? Object.values(item.tags) : []}
                    onDelete={handleDelete}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          <p>No products available...</p>
        )}
      </main>
    </div>
  );
};
