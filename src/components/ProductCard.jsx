export default function ProductCard({ name, price, store, tag }) {
  return (
    <article className="product-card">
      <p className="tag">{tag}</p>
      <h3>{name}</h3>
      <p className="price">{price}</p>
      <p>{store}</p>
    </article>
  );
}
