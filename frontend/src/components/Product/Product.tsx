// The interface remains the same
interface ProductProps {
  image: string;
  title: string;
  price: string;
  badge?: string;
  description: string;
  tags?: string[];
}

export default function Product({ image, title, price, badge, description, tags = [] }: ProductProps) {
  return (
    <div className="max-w-sm rounded-xl overflow-hidden shadow-lg bg-white h-full flex flex-col font-sans">
      {image && <img src={image} alt={title} className="w-full h-48 object-cover" />}

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <span className="text-lg font-semibold text-green-600">{price}</span>
        </div>

        {badge && (
          <span className="inline-block w-fit bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-md mb-2">
            {badge}
          </span>
        )}

        <p className="text-sm text-gray-600 mb-4 flex-grow">{description}</p>

        <div className="mt-auto flex justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {tags.map((tag, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md">
                {tag}
              </span>
            ))}
          </div>

          <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-colors">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
