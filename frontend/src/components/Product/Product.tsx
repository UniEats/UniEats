import "./Product.css";

interface ProductProps {
  image?: string;
  title: string;
  description: string;
  price: string;
  tags: string[];
}

export default function Product({ image, title, description, price, tags }: ProductProps) {
  return (
    <article className="product-card">
      <div className="product-media">
        <img className="product-image" src={image} alt={title} loading="lazy" />
      </div>
      <div className="product-body">
        <div className="product-content">
          <h3 className="product-title">{title}</h3>
          <p className="product-description">{description}</p>
          <span className="product-price">{price}</span>
          {tags.length > 0 ? (
            <ul className="product-tags" aria-label="Dietary tags">
              {tags.map((tag) => (
                <li key={tag} className="product-tag">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="product-actions">
          <button className="product-cta" type="button">
            Order now
          </button>
        </div>
      </div>
    </article>
  );
}
