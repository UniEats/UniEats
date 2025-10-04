import { useMemo, useState } from "react";

import Product from "../Product/Product";
import "./Menu.css";

type MenuItem = {
  title: string;
  description: string;
  price: string;
  tags: string[];
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
        description: "Hand-breaded chicken tucked inside a warm buttermilk biscuit.",
        price: "$3.29",
        tags: ["Protein", "Gluten", "Dairy"],
        image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80",
      },

      {
        title: "Chick-n-Minis®",
        description: "Yeast rolls filled with nuggets and brushed with honey butter glaze.",
        price: "$4.49",
        tags: ["Protein", "Gluten", "Dairy"],
        image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Egg White Grill",
        description: "Grilled chicken, egg whites, and cheese on a toasted multigrain muffin.",
        price: "$4.19",
        tags: ["LowerCal", "Gluten", "Dairy"],
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
      },

      {
        title: "Hash Brown Scramble Bowl",
        description: "Crispy hash browns layered with scrambled eggs, cheese, and nuggets.",
        price: "$5.29",
        tags: ["GlutenFree", "Dairy"],
        image: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Chicken, Egg & Cheese Biscuit",
        description: "Seasoned chicken filet with folded egg and cheese on a biscuit.",
        price: "$4.59",
        tags: ["Protein", "Gluten", "Dairy"],
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Chicken, Egg & Cheese Muffin",
        description: "Whole egg, cheddar, and juicy chicken stacked on an English muffin.",
        price: "$4.79",
        tags: ["Protein", "Gluten", "Dairy"],
        image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Berry Parfait",
        description: "Greek yogurt layered with fresh berries and crunchy granola.",
        price: "$3.69",
        tags: ["Vegetarian", "Gluten", "Dairy"],
        image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Fruit Cup",
        description: "Seasonal mix of strawberries, blueberries, mandarins, and apples.",
        price: "$3.19",
        tags: ["Vegan", "GlutenFree", "DairyFree"],
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
        description: "Spicy chicken breast with pepper jack, lettuce, and tomato on a toasted bun.",
        price: "$5.69",
        tags: ["Spicy", "Gluten", "Dairy"],
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80",
      },
      {
        title: "Grilled Nuggets",
        description: "Marinated chicken bites grilled for a smoky, protein-rich option.",
        price: "$5.35",
        tags: ["GlutenFree", "Protein", "DairyFree"],
        image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?q=80",
      },
      {
        title: "Market Salad",
        description: "Chilled chicken on spring mix with blue cheese, apples, and berries.",
        price: "$9.59",
        tags: ["GlutenFree", "ContainsNuts", "Dairy"],
        image: "https://images.unsplash.com/photo-1485963631004-f2f00b1d6606?q=80",
      },
      {
        title: "Cobb Salad",
        description: "Crispy nuggets over greens with egg, bacon, cheese, and grape tomatoes.",
        price: "$8.99",
        tags: ["Protein", "Gluten", "Dairy"],
        image: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Grilled Chicken Club",
        description: "Grilled filet layered with Colby-Jack cheese, bacon, lettuce, and tomato.",
        price: "$7.89",
        tags: ["Gluten", "Dairy", "ContainsPork"],
        image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80",
      },
      {
        title: "Chick-fil-A® Deluxe Sandwich",
        description: "Classic chicken sandwich with lettuce, tomato, and American cheese.",
        price: "$5.39",
        tags: ["Gluten", "Dairy"],
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
        description: "Shredded kale and cabbage tossed with apple cider vinaigrette.",
        price: "$3.49",
        tags: ["Vegetarian", "GlutenFree", "DairyFree"],
        image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Garden Salad",
        description: "Romaine, tomatoes, roasted corn, bell peppers, and shredded cheese.",
        price: "$7.19",
        tags: ["Vegetarian", "GlutenFree", "Dairy"],
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Southwest Avocado Salad",
        description: "Spicy grilled filet over greens with corn, beans, avocado, and cheese.",
        price: "$9.15",
        tags: ["GlutenFree", "Spicy", "Dairy"],
        image: "https://images.unsplash.com/photo-1484980972926-edee96e0960d?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Seasonal Fruit Blend",
        description: "Rotating selection of ripe fruit served chilled and ready to share.",
        price: "$3.89",
        tags: ["Vegan", "GlutenFree", "DairyFree"],
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
        description: "Crispy waffle-cut potatoes cooked in canola oil and seasoned lightly.",
        price: "$2.49",
        tags: ["Vegan", "GlutenFree", "KosherStyle"],
        image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Mac & Cheese",
        description: "Cheddar and parmesan sauce baked over tender macaroni until golden.",
        price: "$3.59",
        tags: ["Vegetarian", "Gluten", "Dairy"],
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Greek Yogurt Parfait",
        description: "Vanilla Greek yogurt topped with fresh berries and granola crunch.",
        price: "$4.25",
        tags: ["Vegetarian", "Gluten", "Dairy"],
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Chicken Tortilla Soup",
        description: "Hearty soup with shredded chicken, beans, and a mild chili spice.",
        price: "$5.35",
        tags: ["GlutenFree", "Spicy", "DairyFree"],
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
