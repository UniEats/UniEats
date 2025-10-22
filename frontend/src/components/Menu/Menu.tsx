import { useEffect, useMemo, useRef, useState } from "react";
import { useDeleteProduct } from "@/services/ProductServices";
import { useDeleteCombo } from "@/services/ComboServices";
import Product from "../Product/Product";
import "./Menu.css";

import { MenuSection, MenuItem, ComboItem } from "@/models/Menu";

type DisplayItem = (MenuItem | ComboItem) & {
  type: 'product' | 'combo';
  tags?: Record<number, string> | undefined;
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
  const deleteCombo = useDeleteCombo();

  const handleDeleteItem = async (id: number, type: 'product' | 'combo') => {
    try {
      if (type === 'product') {
        await deleteProduct.mutateAsync(id);
      } else {
        await deleteCombo.mutateAsync(id);
      }
    } catch (error) {
      console.error(`Error deleting ${type}`, error);
      alert(`The ${type} could not be deleted.`);
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

  const displayItems: DisplayItem[] = useMemo(() => {
    if (!activeSection) return [];

    const products: DisplayItem[] = activeSection.products.map(p => ({ ...p, type: 'product' }));
    const combos: DisplayItem[] = activeSection.combos.map(c => ({ ...c, type: 'combo' }));

    return [...products, ...combos];
  }, [activeSection]);

return (
    <div className="menu-page">
      <nav className="menu-categories" aria-label="Menu sections">
        <ul role="tablist">
          {menuSections.map((section) => {
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
          })}
        </ul>
      </nav>

      <main id="menu-section">
        {activeSection ? (
          <>
            <section className="menu-hero">
              <h1>{activeSection.label}</h1>
              <p>{activeSection.description}</p>
            </section>
            {displayItems.length > 0 ? (
              <section className="menu-grid-section">
                <div className="menu-grid">
                  {displayItems.map((item) => (
                    <Product
                      key={item.id}
                      id={item.id}
                      image={item.image}
                      title={item.name}
                      description={item.description}
                      price={item.price}
                      tags={item.tags ? Object.values(item.tags) : []}
                      onDelete={() => handleDeleteItem(item.id, item.type)}
                    />
                  ))}
                </div>
              </section>
            ) : (
              <p className="no-items-message">No products or combos available in this section...</p>
            )}
          </>
        ) : (
          <p className="no-items-message">No menu sections available</p>
        )}
      </main>
    </div>
  );
};
