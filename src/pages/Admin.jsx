export default function Admin({ prices }) {
  return (
    <section className="page">
      <h2>Admin Dashboard</h2>
      <p>Review new community submissions and manage price records.</p>
      <div className="admin-panel">
        <div className="card-box">
          <h3>Pending approvals</h3>
          <p>{prices.filter((entry) => !entry.approved).length} new submissions</p>
        </div>
        <div className="card-box">
          <h3>Tracked items</h3>
          <p>{new Set(prices.map((entry) => entry.productName)).size} products</p>
        </div>
      </div>
    </section>
  );
}
