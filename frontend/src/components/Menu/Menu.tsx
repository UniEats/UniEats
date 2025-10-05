import { useMemo, useState } from "react";
import { useDeleteProduct } from "@/services/ProductServices";
import Product from "../Product/Product";
import "./Menu.css";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  tags?: string[] | undefined;
  // image?: string;
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
  const [sections, setSections] = useState<MenuSection[]>(menuSections);
  const [activeCategoryId, setActiveCategoryId] = useState<MenuSection["id"] | null>(
    menuSections.length > 0 ? menuSections[0].id : null
  );
  
  const deleteProduct = useDeleteProduct();

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct.mutateAsync(id);

      setSections((prevSections) =>
        prevSections.map((section) =>
          section.id === activeCategoryId
            ? {
                ...section,
                products: section.products.filter((item) => item.id !== id),
              }
            : section
        )
      );
    } catch (error) {
      console.error("Error deleting product", error);
      alert("No se pudo eliminar el producto");
    }
  };

  const activeSection = useMemo(() => {
    if (sections.length === 0) return undefined;
    return sections.find((section) => section.id === activeCategoryId) ?? sections[0];
  }, [activeCategoryId, sections]);


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
                  className={`menu-category${isActive ? " menu-category--active" : ""}`}
                  onClick={() => setActiveCategoryId(section.id)}
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

            <section className="menu-grid-section">
              <div className="menu-grid">
                {activeSection.products.map((item) => (
                  <Product 
                    key={item.name} 
                    id={item.id}
                    // image={item.image} 
                    title={item.name} 
                    description={item.description} 
                    price={item.price} 
                    tags={item.tags ?? []} 
                    onDelete={handleDelete} 
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          <p>Cargando menú...</p>
        )}
      </main>
    </div>
  );
}
