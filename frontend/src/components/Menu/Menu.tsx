import { useMemo, useState } from "react";

import Product from "../Product/Product";
import "./Menu.css";

type MenuItem = {
  title: string;
  calories: string;
  image?: string;
};

type MenuSection = {
  id: string;
  label: string;
  subtitle: string;
  items: MenuItem[];
};

const menuSections: MenuSection[] = [
  {
    id: "breakfast",
    label: "Breakfast",
    subtitle: "Price and availability may vary by location.",
    items: [
      {
        title: "Chick-fil-A® Chicken Biscuit",
        calories: "440 Cal per Biscuit",
        image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80",
      },

      {
        title: "Chick-n-Minis®",
        calories: "360 Cal per 4 Chick-n-Minis",
        image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Egg White Grill",
        calories: "300 Cal per Sandwich",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
      },

      {
        title: "Hash Brown Scramble Bowl",
        calories: "470 Cal per Bowl",
        image: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Chicken, Egg & Cheese Biscuit",
        calories: "560 Cal per Biscuit",
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Chicken, Egg & Cheese Muffin",
        calories: "470 Cal per Sandwich",
        image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Berry Parfait",
        calories: "270 Cal per Serving",
        image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Fruit Cup",
        calories: "70 Cal per Serving",
        image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    id: "entrees",
    label: "Entrées",
    subtitle: "Crafted classics and guest favorites served hot and fast.",
    items: [
      {
        title: "Spicy Deluxe Sandwich",
        calories: "550 Cal per Sandwich",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80",
      },
      {
        title: "Grilled Nuggets",
        calories: "200 Cal per 8-count",
        image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?q=80",
      },
      {
        title: "Market Salad",
        calories: "330 Cal per Salad",
        image: "https://images.unsplash.com/photo-1485963631004-f2f00b1d6606?q=80",
      },
      {
        title: "Cobb Salad",
        calories: "390 Cal per Salad",
        image: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Grilled Chicken Club",
        calories: "520 Cal per Sandwich",
        image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80",
      },
      {
        title: "Chick-fil-A® Deluxe Sandwich",
        calories: "500 Cal per Sandwich",
        image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80",
      },
    ],
  },
  {
    id: "salads",
    label: "Salads",
    subtitle: "Fresh greens, vibrant toppings, and house-made dressings.",
    items: [
      {
        title: "Kale Crunch Side",
        calories: "170 Cal per Serving",
        image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Garden Salad",
        calories: "230 Cal per Bowl",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Southwest Avocado Salad",
        calories: "420 Cal per Salad",
        image: "https://images.unsplash.com/photo-1484980972926-edee96e0960d?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Seasonal Fruit Blend",
        calories: "110 Cal per Serving",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    id: "sides",
    label: "Sides",
    subtitle: "Pair your entrée with crispy, creamy, or fresh-made sides.",
    items: [
      {
        title: "Waffle Potato Fries®",
        calories: "420 Cal per Medium",
        image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Mac & Cheese",
        calories: "260 Cal per Cup",
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Greek Yogurt Parfait",
        calories: "240 Cal per Serving",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Chicken Tortilla Soup",
        calories: "380 Cal per Bowl",
        image: "https://images.unsplash.com/photo-1455612693675-112974d4880b?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
];

export default function Menu() {
  const [activeCategoryId, setActiveCategoryId] = useState<MenuSection["id"]>(menuSections[0]?.id ?? "breakfast");

  const activeSection = useMemo(
    () => menuSections.find((section) => section.id === activeCategoryId) ?? menuSections[0],
    [activeCategoryId],
  );

  return (
    <div className="menu-page">
      <header className="menu-topbar">
        <div className="menu-topbar__brand" aria-label="Dining brand">
          IDS Dining
        </div>
        <nav className="menu-topbar__links" aria-label="Primary">
          <a href="#">Find a restaurant</a>
          <a href="#">Menu</a>
          <a href="#">Stories</a>
          <a href="#">About</a>
          <a href="#">Careers</a>
        </nav>
        <div className="menu-topbar__actions">
          <button className="menu-topbar__ghost" type="button">
            Sign in
          </button>
          <button className="menu-topbar__cta" type="button">
            Order now
          </button>
        </div>
      </header>

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
        <section className="menu-hero">
          <h1>{activeSection.label}</h1>
          <p>{activeSection.subtitle}</p>
        </section>

        <section className="menu-grid-section">
          <div className="menu-grid">
            {activeSection.items.map((item) => (
              <Product key={item.title} {...item} />
            ))}
          </div>
        </section>

        <section className="menu-next">
          <div className="menu-next__card">
            <span className="menu-eyebrow">What&apos;s next</span>
            <h2>Explore entrées</h2>
            <button type="button" className="menu-next__link">
              View entrées
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
