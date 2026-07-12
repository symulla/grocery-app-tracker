import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import LiveOffers from '../components/LiveOffers';

export default function Home({ products, prices }) {
  const [query, setQuery] = useState('');

  const filteredPrices = useMemo(() => {
    if (!query) return prices;
    return prices.filter((entry) => entry.productName.toLowerCase().includes(query.toLowerCase()));
  }, [query, prices]);

  return (
    <section className="page home-page">
      <div className="hero">
        <h1>Community grocery price tracker</h1>
        <p>Users contribute prices from local supermarkets so everyone can find the best deals.</p>
        <div className="search-bar">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for a product like Cooking Oil" />
          <button>Search</button>
        </div>
      </div>

      <LiveOffers />

      <div className="section-heading">
        <h2>Featured products</h2>
        <Link to="/compare" className="text-link">Compare prices</Link>
      </div>

      <div className="grid">
        {products.map((product) => (
          <ProductCard key={product.id} name={product.name} price="See latest" store="Community submitted" tag={product.category} />
        ))}
      </div>

      <div className="section-heading">
        <h2>Latest community submissions</h2>
      </div>

      <div className="grid">
        {filteredPrices.map((entry) => (
          <div className="product-card" key={entry.id}>
            <p className="tag">{entry.supermarket}</p>
            <h3>{entry.productName}</h3>
            <p className="price">KSh {entry.price}</p>
            <p>{entry.location}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
