export default function TrendChart({ points }) {
  if (!points || points.length === 0) {
    return <p>No trend data available.</p>;
  }

  const maxValue = Math.max(...points.map((point) => point.value));

  return (
    <div className="trend-chart">
      {points.map((point) => (
        <div key={point.label} className="trend-bar">
          <div className="trend-fill" style={{ height: `${(point.value / maxValue) * 100}%` }} />
          <span>{point.label}</span>
        </div>
      ))}
    </div>
  );
}
