import Product from "../Product/Product";

export default function Menu() {
  const products = [
    {
      title: "Classic Breakfast Sandwich",
      price: "$6.95",
      badge: "Hot",
      description: "Freshly scrambled eggs, crispy bacon, and melted cheese on a toasted English muffin.",
      tags: ["Contains Gluten", "Contains Dairy"],
      image: "https://images.unsplash.com/photo-1551893314-5501a3579e94?q=80&w=2070",
    },
    {
      title: "Steel Cut Oatmeal Bowl",
      price: "$4.50",
      badge: "Healthy",
      description: "Hearty steel cut oats topped with fresh berries, honey, and chopped walnuts.",
      tags: ["Vegetarian", "Gluten-Free Option"],
      image: "https://images.unsplash.com/photo-1585239999009-3839c14532f8?q=80&w=2070",
    },
    {
      title: "Avocado Toast",
      price: "$7.25",
      badge: "Healthy",
      description: "Smashed avocado on multigrain bread with cherry tomatoes, feta cheese, and everything seasoning.",
      tags: ["Vegetarian", "Contains Gluten"],
      image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=2080",
    },
    {
      title: "Belgian Waffle",
      price: "$5.95",
      badge: "Sweet",
      description: "A golden waffle served with maple syrup and fresh whipped cream.",
      tags: ["Contains Gluten", "Contains Dairy"],
      image: "https://images.unsplash.com/photo-1562376552-0d160a2f86d7?q=80&w=1974",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-5 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🍴</span>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">University Cafeteria</h1>
            <p className="text-sm text-gray-500">Tuesday, September 30, 2025</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">Open 7:00 AM - 9:00 PM</span>
          <span className="text-xs bg-gray-100 text-gray-900 px-2.5 py-1 rounded-lg">Boss Only</span>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex justify-center gap-4 mb-5">
        <button className="px-4 py-2 text-sm font-semibold text-gray-800 bg-gray-200 rounded-full">Breakfast</button>
        <button className="px-4 py-2 text-sm text-gray-700 bg-transparent rounded-full">Lunch</button>
        <button className="px-4 py-2 text-sm text-gray-700 bg-transparent rounded-full">Dinner</button>
        <button className="px-4 py-2 text-sm text-gray-700 bg-transparent rounded-full">Snacks</button>
      </nav>

      {/* Section */}
      <section className="mb-4 text-center md:text-left">
        <h2 className="text-lg font-semibold text-gray-900">Breakfast Menu</h2>
        <p className="text-sm text-gray-500">Available 7:00 AM - 11:00 AM</p>
      </section>

      {/* Grid of products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        {products.map((item, index) => (
          <Product key={index} {...item} />
        ))}
      </div>
    </div>
  );
}
