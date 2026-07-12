import { useMemo, useState } from 'react';
import { initialProducts } from '../data/seedData';
import PriceHistory from '../components/PriceHistory';

export default function PriceHistoryPage({ prices }) {
  const [selectedProduct, setSelectedProduct] = useState(initialProducts[0].name);

  const selectedPrices = useMemo(() => {
    return prices.filter((entry) => entry.productName === selectedProduct);
  }, [prices, selectedProduct]);

  return (
    <section className="page">
      <h2>Price History</h2>
      <p>Review previous prices, averages, and price movement for common products.</p>
      <select value={selectedProduct} onChange={(event) => setSelectedProduct(event.target.value)}>
        {initialProducts.map((product) => (
          <option key={product.id} value={product.name}>
            {product.name}
          </option>
        ))}
      </select>
      <PriceHistory prices={selectedPrices} />
    </section>
  );
}
