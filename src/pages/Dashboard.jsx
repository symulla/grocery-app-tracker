import { Link } from 'react-router-dom';
import PriceTable from '../components/PriceTable';
import PriceHistory from '../components/PriceHistory';
import TrendChart from '../components/TrendChart';

export default function Dashboard({ prices }) {
  const cheapestBySupermarket = prices.reduce((map, entry) => {
    const current = map[entry.supermarket];
    if (!current || entry.price < current.price) {
      map[entry.supermarket] = entry;
    }
    return map;
  }, {});

  const cookingOilHistory = prices.filter((entry) => entry.productName === 'Cooking Oil (1L)');
  const trendPoints = cookingOilHistory.slice(-5).map((entry) => ({ label: entry.date, value: entry.price }));
  const averagePrice = prices.length
    ? Math.round(prices.reduce((sum, entry) => sum + entry.price, 0) / prices.length)
    : 0;
  const cheapestPrice = prices.length ? Math.min(...prices.map((entry) => entry.price)) : 0;
  const uniqueSupermarkets = new Set(prices.map((entry) => entry.supermarket)).size;

  return (
    <section className="page">
      <div className="dashboard-hero">
        <div>
          <h2>Dashboard</h2>
          <p>View recent grocery prices, price trends, cheapest supermarkets, and submit a new price.</p>
        </div>
        <Link to="/add-price" className="primary-button">Submit a new price</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Active prices</span>
          <strong className="stat-value">{prices.length}</strong>
          <p>Verified community entries</p>
        </div>
        <div className="stat-card">
          <span className="stat-label">Average price</span>
          <strong className="stat-value">KSh {averagePrice}</strong>
          <p>Across current tracked items</p>
        </div>
        <div className="stat-card">
          <span className="stat-label">Cheapest store</span>
          <strong className="stat-value">KSh {cheapestPrice}</strong>
          <p>Lowest observed price this week</p>
        </div>
        <div className="stat-card">
          <span className="stat-label">Stores tracked</span>
          <strong className="stat-value">{uniqueSupermarkets}</strong>
          <p>Retail locations in the network</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card-box">
          <h3>Recent prices</h3>
          <PriceTable prices={prices.slice(0, 6)} />
        </div>

        <div className="card-box">
          <h3>Price trends</h3>
          <TrendChart points={trendPoints} />
        </div>
      </div>

      <div className="section-heading">
        <h3>Cheapest supermarkets</h3>
      </div>
      <div className="grid">
        {Object.values(cheapestBySupermarket).map((entry) => (
          <div className="card-box" key={entry.id}>
            <h4>{entry.supermarket}</h4>
            <p>{entry.productName} — KSh {entry.price}</p>
            <p>{entry.location}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
