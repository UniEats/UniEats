import { useMemo, useState } from "react";
import { Link } from "wouter";

import { IngredientForm } from "@/components/AdminForms/IngredientForm";
import { MenuSectionForm } from "@/components/AdminForms/MenuSectionForm";
import { ProductForm } from "@/components/AdminForms/ProductForm";
import { ProductUpdateForm } from "@/components/AdminForms/ProductUpdateForm";
import { TagForm } from "@/components/AdminForms/TagForm";
import { ComboForm } from "@/components/AdminForms/ComboForm";
import { ComboUpdateForm } from "@/components/AdminForms/ComboUpdateForm";
import { Modal } from "@/components/Modal/Modal";
import { useIngredientList } from "@/services/IngredientServices";
import { useMenuSectionList } from "@/services/MenuSectionServices";
import { useDeleteProduct, useProductList } from "@/services/ProductServices";
import { useTagList } from "@/services/TagServices";
import { useDeleteCombo, useComboList } from "@/services/ComboServices"
import { useToken } from "@/services/TokenContext";
import { useUserCount } from "@/services/UserServices";

import styles from "./AdminDashboard.module.css";

type ModalType = "ingredient" | "tag" | "product-create" | "product-update" | "menu-section" | "combo-create" | "combo-update" | null;

type SectionId = (typeof SIDEBAR_ITEMS)[number]["id"];

type StatCard = {
  id: string;
  label: string;
  icon: string;
  value: number | null;
  isLoading?: boolean;
};

const SIDEBAR_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "products", label: "Products", icon: "🍽️" },
  { id: "menu-sections", label: "Menu Sections", icon: "📂" },
  { id: "ingredients", label: "Ingredients", icon: "🥕" },
  { id: "tags", label: "Tags", icon: "🏷️" },
  { id: "users", label: "Users", icon: "👥" },
  { id: "combos", label: "Combos", icon: "🍔🍟🥤"}
] as const;

const LOW_STOCK_THRESHOLD = 10;

export const AdminDashboard = () => {
  const [, setTokenState] = useToken();
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [openModal, setOpenModal] = useState<ModalType>(null);

  const { data: products, isPending: productsPending } = useProductList();
  const { data: ingredients, isPending: ingredientsPending } = useIngredientList();
  const { data: menuSections, isPending: menuSectionsPending } = useMenuSectionList();
  const { data: tags, isPending: tagsPending } = useTagList();
  const { data: userCount, isPending: usersPending } = useUserCount();
  const { data: combos, isPending: combosPending } = useComboList();
  const deleteProductMutation = useDeleteProduct();
  const deleteComboMutation = useDeleteCombo();

  const closeModal = () => setOpenModal(null);
  const handleLogout = () => setTokenState({ state: "LOGGED_OUT" });

  const productList = useMemo(() => products ?? [], [products]);
  const ingredientList = useMemo(() => ingredients ?? [], [ingredients]);
  const menuSectionList = useMemo(() => menuSections ?? [], [menuSections]);
  const tagList = useMemo(() => tags ?? [], [tags]);
  const comboList = useMemo(() => combos ?? [], [combos]);
  const totalUsers = userCount?.total ?? null;
  const totalProducts = productList.length;
  const totalIngredients = ingredientList.length;
  const totalSections = menuSectionList.length;
  const totalCombos = comboList.length;

  const statCards: StatCard[] = useMemo(
    () => [
      { id: "products", label: "Total Products", icon: "🍽️", value: totalProducts, isLoading: productsPending },
      {
        id: "ingredients",
        label: "Total Ingredients",
        icon: "🥦",
        value: totalIngredients,
        isLoading: ingredientsPending,
      },
      { id: "sections", label: "Menu Sections", icon: "📁", value: totalSections, isLoading: menuSectionsPending },
      { id: "users", label: "Registered Users", icon: "👥", value: totalUsers, isLoading: usersPending },
      { id: "combos", label: "Total Combos", icon: "🍔🍟🥤", value: totalCombos, isLoading: combosPending },
    ],
    [
      totalProducts,
      productsPending,
      totalIngredients,
      ingredientsPending,
      totalSections,
      menuSectionsPending,
      totalUsers,
      usersPending,
      totalCombos,
      combosPending,
    ],
  );

  const recentProducts = useMemo(() => {
    const sorted = [...productList].sort((a, b) => b.id - a.id);
    return sorted.slice(0, 6);
  }, [productList]);

  const lowStockIngredients = useMemo(
    () => ingredientList.filter((ingredient) => ingredient.stock < LOW_STOCK_THRESHOLD),
    [ingredientList],
  );

  const isAnyLoading = productsPending || ingredientsPending || menuSectionsPending || tagsPending || usersPending;

  const setSection = (section: SectionId) => {
    setActiveSection(section);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  const handleDeleteProduct = async (id: number) => {
    const target = productList.find((product) => product.id === id)?.name ?? "this product";
    const confirmed = window.confirm(`Delete ${target}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteProductMutation.mutateAsync(id);
    } catch (err) {
      console.error(err);
      alert("Unable to delete the product. Please try again.");
    }
  };

  const handleDeleteCombo = async (id: number) => {
    const target = comboList.find((combo) => combo.id === id)?.name ?? "this combo";
    const confirmed = window.confirm(`Delete ${target}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteComboMutation.mutateAsync(id);
    } catch (err) {
      console.error(err);
      alert("Unable to delete the combo. Please try again.");
    }
  };

  const renderDashboard = () => (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Today</p>
          <h2 className={styles.sectionTitle}>Dining overview</h2>
        </div>
        <div className={styles.sectionActions}>
          <button className={styles.secondaryButton} onClick={() => setOpenModal("product-create")}>
            + Add product
          </button>
          <button className={styles.secondaryButton} onClick={() => setOpenModal("ingredient")}>
            + Restock ingredient
          </button>
        </div>
      </header>

      <div className={styles.statGrid}>
        {statCards.map((card, index) => (
          <article
            key={card.id}
            className={`${styles.statCard} ${styles[`statCardAccent${index % 4}`]}`}
            aria-live="polite"
          >
            <div className={styles.statIcon}>{card.icon}</div>
            <p className={styles.statLabel}>{card.label}</p>
            <p className={styles.statValue}>{card.isLoading ? "…" : (card.value?.toLocaleString() ?? "–")}</p>
          </article>
        ))}
      </div>

      <div className={styles.panelGrid}>
        <article className={styles.panel}>
          <header className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Recently added products</h3>
            <span className={styles.panelMeta}>{recentProducts.length} items</span>
          </header>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Price</th>
                  <th scope="col">Tags</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>{Object.keys(product.tags).length > 0 ? Object.values(product.tags).join(", ") : "—"}</td>{" "}
                  </tr>
                ))}
                {recentProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className={styles.emptyCell}>
                      No products available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className={styles.panel}>
          <header className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Low stock ingredients</h3>
            <span className={styles.panelMeta}>Threshold &lt; {LOW_STOCK_THRESHOLD}</span>
          </header>
          <ul className={styles.lowStockList}>
            {lowStockIngredients.map((ingredient) => (
              <li key={ingredient.id} className={styles.lowStockItem}>
                <div>
                  <p className={styles.lowStockName}>{ingredient.name}</p>
                  <p className={styles.lowStockDescription}>{ingredient.description}</p>
                </div>
                <span className={styles.lowStockBadge}>{ingredient.stock}</span>
              </li>
            ))}
            {lowStockIngredients.length === 0 && (
              <li className={styles.emptyState}>All ingredients are well stocked.</li>
            )}
          </ul>
        </article>
      </div>
    </section>
  );

  const renderProducts = () => (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Catalog</p>
          <h2 className={styles.sectionTitle}>Products</h2>
          <p className={styles.sectionSubtitle}>Manage every item available to students.</p>
        </div>
        <div className={styles.sectionActions}>
          <button className={styles.primaryButton} onClick={() => setOpenModal("product-create")}>
            Add product
          </button>
          <button className={styles.secondaryButton} onClick={() => setOpenModal("product-update")}>
            Update product
          </button>
        </div>
      </header>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Description</th>
              <th scope="col">Price</th>
              <th scope="col">Tags</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {productList.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td className={styles.descriptionCell}>{product.description}</td>
                <td>{formatCurrency(product.price)}</td>
                <td>{Object.keys(product.tags).length > 0 ? Object.values(product.tags).join(", ") : "—"}</td>
                <td>
                  <button
                    className={styles.dangerButton}
                    onClick={() => handleDeleteProduct(product.id)}
                    disabled={deleteProductMutation.isPending}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {productList.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.emptyCell}>
                  No products loaded. Add your first item to populate the menu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderMenuSections = () => (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Structure</p>
          <h2 className={styles.sectionTitle}>Menu sections</h2>
          <p className={styles.sectionSubtitle}>Create meaningful categories for quicker discovery.</p>
        </div>
        <div className={styles.sectionActions}>
          <button className={styles.primaryButton} onClick={() => setOpenModal("menu-section")}>
            Add section
          </button>
        </div>
      </header>
      <div className={styles.cardColumn}>
        {menuSectionList.map((section) => (
          <article key={section.id} className={styles.sectionCard}>
            <h3>{section.label}</h3>
            <p>{section.description}</p>
          </article>
        ))}
        {menuSectionList.length === 0 && <p className={styles.emptyState}>You have not created menu sections yet.</p>}
      </div>
    </section>
  );

  const renderIngredients = () => (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Inventory</p>
          <h2 className={styles.sectionTitle}>Ingredients</h2>
          <p className={styles.sectionSubtitle}>Track availability and restock ahead of time.</p>
        </div>
        <div className={styles.sectionActions}>
          <button className={styles.primaryButton} onClick={() => setOpenModal("ingredient")}>
            Add ingredient
          </button>
        </div>
      </header>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Description</th>
              <th scope="col">Stock</th>
            </tr>
          </thead>
          <tbody>
            {ingredientList.map((ingredient) => (
              <tr key={ingredient.id}>
                <td>{ingredient.name}</td>
                <td className={styles.descriptionCell}>{ingredient.description}</td>
                <td>
                  <span className={ingredient.stock < LOW_STOCK_THRESHOLD ? styles.stockWarning : styles.stockNormal}>
                    {ingredient.stock}
                  </span>
                </td>
              </tr>
            ))}
            {ingredientList.length === 0 && (
              <tr>
                <td colSpan={3} className={styles.emptyCell}>
                  Inventory is empty. Add your key ingredients to monitor stock.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderTags = () => (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Metadata</p>
          <h2 className={styles.sectionTitle}>Tags</h2>
          <p className={styles.sectionSubtitle}>Highlight dietary considerations and featured items.</p>
        </div>
        <div className={styles.sectionActions}>
          <button className={styles.primaryButton} onClick={() => setOpenModal("tag")}>
            Add tag
          </button>
        </div>
      </header>
      <ul className={styles.tagList}>
        {tagList.map((tag) => (
          <li key={tag.id} className={styles.tagPill}>
            #{tag.tag}
          </li>
        ))}
        {tagList.length === 0 && <li className={styles.emptyState}>Create your first tag to streamline filtering.</li>}
      </ul>
    </section>
  );

  const renderUsers = () => (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Access</p>
          <h2 className={styles.sectionTitle}>Users</h2>
          <p className={styles.sectionSubtitle}>Keep track of who can manage the cafeteria data.</p>
        </div>
      </header>
      <div className={styles.userSummary}>
        <div className={styles.userSummaryCard}>
          <span className={styles.userSummaryTitle}>Registered admins &amp; staff</span>
          <span className={styles.userSummaryValue}>{usersPending ? "…" : (totalUsers?.toLocaleString() ?? "–")}</span>
          <p className={styles.userSummaryHint}>
            Manage roles via the authentication service. Role changes will surface here once new endpoints are
            available.
          </p>
        </div>
      </div>
    </section>
  );

  const renderCombos = () => (
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Catalog</p>
            <h2 className={styles.sectionTitle}>Combos</h2>
            <p className={styles.sectionSubtitle}>Manage combo meals and special offers.</p>
          </div>
          <div className={styles.sectionActions}>
            <button className={styles.primaryButton} onClick={() => setOpenModal("combo-create")}>
              Add combo
            </button>
            <button className={styles.secondaryButton} onClick={() => setOpenModal("combo-update")}>
              Update combo
            </button>
          </div>
        </header>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Description</th>
                <th scope="col">Price</th>
                <th scope="col">Tags</th>
                <th scope="col">Products</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {comboList.length > 0 ? (
                comboList.map((combo) => (
                  <tr key={combo.id}>
                    <td>{combo.name}</td>
                    <td className={styles.descriptionCell}>{combo.description}</td>
                    <td>{formatCurrency(combo.price)}</td>
                    <td>{Object.keys(combo.tags).length > 0 ? Object.values(combo.tags).join(", ") : "—"}</td>
                    <td>
                      {combo.products.length > 0
                        ? combo.products
                            .map((product) => `${product.quantity} x ${product.name}`)
                            .join(", ")
                        : "—"}
                    </td>
                    <td>
                      <button
                        className={styles.dangerButton}
                        onClick={() => handleDeleteCombo(combo.id)}
                        disabled={deleteComboMutation.isPending}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>
                    No combos loaded. Add your first combo to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboard();
      case "products":
        return renderProducts();
      case "menu-sections":
        return renderMenuSections();
      case "ingredients":
        return renderIngredients();
      case "tags":
        return renderTags();
      case "users":
        return renderUsers();
      case "combos":
        return renderCombos();
      default:
        return null;
    }
  };

  return (
    <div className={styles.dashboardShell}>
      <aside className={styles.sidebar}>
        <div className={styles.brandArea}>
          <span className={styles.brandMark}>Dining Admin</span>
          <span className={styles.brandSubtitle}>University cafeteria</span>
        </div>
        <nav aria-label="Admin navigation" className={styles.sidebarNav}>
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === activeSection ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem}
              onClick={() => setSection(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <button type="button" className={styles.logoutButton} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <section className={styles.mainArea}>
        <header className={styles.topbar}>
          <div>
            <h1 className={styles.topbarTitle}>{SIDEBAR_ITEMS.find((item) => item.id === activeSection)?.label}</h1>
            <p className={styles.topbarSubtitle}>Admin panel · Control every detail of your cafeteria service.</p>
          </div>
          <div className={styles.topbarActions}>
            <Link href="/menu" className={styles.primaryButton}>
              View Live Menu
            </Link>
            <input
              className={styles.searchField}
              type="search"
              placeholder="Search products, tags, ingredients"
              aria-label="Search"
            />
          </div>
        </header>
        <main className={styles.mainContent}>
          {isAnyLoading && <p className={styles.loadingNote}>Loading freshest data…</p>}
          {renderActiveSection()}
        </main>
      </section>

      {openModal === "ingredient" && (
        <Modal onClose={closeModal}>
          <IngredientForm onClose={closeModal} />
        </Modal>
      )}
      {openModal === "tag" && (
        <Modal onClose={closeModal}>
          <TagForm onClose={closeModal} />
        </Modal>
      )}
      {openModal === "product-create" && (
        <Modal onClose={closeModal}>
          <ProductForm onClose={closeModal} />
        </Modal>
      )}
      {openModal === "product-update" && (
        <Modal onClose={closeModal}>
          <ProductUpdateForm onClose={closeModal} />
        </Modal>
      )}
      {openModal === "menu-section" && (
        <Modal onClose={closeModal}>
          <MenuSectionForm onClose={closeModal} />
        </Modal>
      )}
      {openModal === "combo-create" && (
          <Modal onClose={closeModal}>
            <ComboForm onClose={closeModal} />
          </Modal>
      )}
      {openModal === "combo-update" && (
        <Modal onClose={closeModal}>
          <ComboUpdateForm onClose={closeModal} />
        </Modal>
      )}
    </div>
  );
};