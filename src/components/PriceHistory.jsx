import { useMemo } from 'react';

export default function PriceHistory({ prices }) {
  const summary = useMemo(() => {
    if (!prices.length) return null;

    const values = prices.map((item) => item.price);
    const lowest = Math.min(...values);
    const highest = Math.max(...values);
    const average = (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(0);

    return { lowest, highest, average };
  }, [prices]);

  if (!summary) {
    return <p>No history yet.</p>;
  }

  return (
    <div className="history-card">
      <h3>Price Summary</h3>
      <p>Current average: KSh {summary.average}</p>
      <p>Highest: KSh {summary.highest}</p>
      <p>Lowest: KSh {summary.lowest}</p>
      <ul>
        {prices.map((entry) => (
          <li key={entry.id}>
            {entry.supermarket} — KSh {entry.price} ({entry.date})
          </li>
        ))}
      </ul>
    </div>
  );
}
