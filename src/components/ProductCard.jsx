export default function ProductCard({ name, prices = [], tag }) {
  const cheapest = prices.length
    ? prices.reduce((lowest, entry) => (entry.price < lowest.price ? entry : lowest), prices[0])
    : null;

  return (
    <article className="product-card">
      <p className="tag">{tag}</p>
      <h3>{name}</h3>
      {cheapest ? (
        <>
          <p className="price">From KSh {cheapest.price}</p>
          <p className="product-card__store">Cheapest at {cheapest.supermarket}</p>
          <ul className="product-price-list" aria-label={`${name} prices by supermarket`}>
            {prices.map((entry) => <li key={entry.id}>{entry.supermarket}: KSh {entry.price}</li>)}
          </ul>
        </>
      ) : <p>No approved prices yet.</p>}
    </article>
  );
}
