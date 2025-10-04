import "./Product.css";

interface ProductProps {
  image?: string;
  title: string;
  calories: string;
}

export default function Product({ image, title, calories }: ProductProps) {
  return (
    <article className="product-card">
      <div className="product-media">
        <img className="product-image" src={image} alt={title} loading="lazy" />
      </div>
      <div className="product-body">
        <h3 className="product-title">{title}</h3>
        <p className="product-meta">{calories}</p>
        <button className="product-cta" type="button">
          Order now
        </button>
      </div>
    </article>
  );
}
