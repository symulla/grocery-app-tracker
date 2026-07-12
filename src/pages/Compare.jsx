import { useMemo, useState } from 'react';

export default function Compare({ prices, products }) {
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.name ?? '');

  const productPrices = useMemo(() => {
    return prices.filter((entry) => entry.productName === selectedProduct);
  }, [prices, selectedProduct]);

  const cheapest = useMemo(() => {
    if (!productPrices.length) return null;
    return productPrices.reduce((lowest, item) => (item.price < lowest.price ? item : lowest), productPrices[0]);
  }, [productPrices]);

  return (
    <section className="page">
      <h2>Compare Prices</h2>
      <p>Compare like-for-like essentials across Naivas, Carrefour, and Quickmart.</p>
      <select value={selectedProduct} onChange={(event) => setSelectedProduct(event.target.value)}>
        {products.map((product) => (
          <option key={product.id} value={product.name}>{product.name}</option>
        ))}
      </select>

      <div className="grid compare-grid">
        {productPrices.map((entry) => (
          <div className={`card-box ${entry.id === cheapest?.id ? 'best-deal' : ''}`} key={entry.id}>
            <h3>{entry.supermarket}</h3>
            <p className="price">KSh {entry.price}</p>
            <p>{entry.location}</p>
            <p className="price-source">{entry.approved ? 'Researched June 2026' : 'Awaiting community review'}</p>
            {entry.id === cheapest?.id && <p className="tag">Cheapest</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
