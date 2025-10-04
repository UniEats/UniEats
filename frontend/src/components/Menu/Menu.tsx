import Product from "../Product/Product";
import "./Menu.css";

const categories = [
  "Breakfast",
  "Entrées",
  "Salads",
  "Sides",
  "Kid's Meals",
  "Treats",
  "Beverages",
  "Dipping Sauces & Dressings",
  "Catering",
  "Family Style Meals",
];

const menuItems = [
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
];

export default function Menu() {
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
          <button className="menu-topbar__ghost">Sign in</button>
          <button className="menu-topbar__cta">Order now</button>
        </div>
      </header>

      <nav className="menu-categories" aria-label="Menu sections">
        <ul>
          {categories.map((label) => (
            <li key={label}>
              <button className={`menu-category${label === "Breakfast" ? " menu-category--active" : ""}`}>
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main>
        <section className="menu-hero">
          <h1>Breakfast</h1>
          <p>Price and availability may vary by location.</p>
        </section>

        <section className="menu-grid-section">
          <div className="menu-grid">
            {menuItems.map((item) => (
              <Product key={item.title} {...item} />
            ))}
          </div>
        </section>
      </main>

      <section className="menu-next">
        <div className="menu-next__card">
          <span className="menu-eyebrow">What&apos;s next</span>
          <h2>Explore entrées</h2>
          <button type="button" className="menu-next__link">
            View entrées
          </button>
        </div>
      </section>
    </div>
  );
}
