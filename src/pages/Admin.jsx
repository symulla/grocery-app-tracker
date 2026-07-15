import { useState } from 'react';

export default function Admin({
  prices,
  products,
  users,
  currentUser,
  onApprovePrice,
  onDeletePrice,
  onDeleteUser,
  onDeleteProduct
}) {
  const [processingId, setProcessingId] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const pendingPrices = prices.filter((entry) => !entry.approved && !entry.reviewed);

  const approvePrice = async (priceId) => {
    setProcessingId(priceId);
    setLookupError('');
    try {
      await onApprovePrice(priceId);
    } catch (error) {
      setLookupError(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="page admin-page">
      <div className="page-hero">
        <h2>Admin Dashboard</h2>
        <p>Review community prices, remove misleading records, and manage the marketplace catalogue.</p>
      </div>

      <div className="admin-panel">
        <div className="card-box"><h3>Pending approvals</h3><p>{pendingPrices.length} price submissions need review</p></div>
        <div className="card-box"><h3>Tracked products</h3><p>{products.length} products in the catalogue</p></div>
      </div>

      <section className="admin-section">
        <div className="section-heading"><h3>Approve or remove price submissions</h3></div>
        {lookupError && <p className="form-error">{lookupError}</p>}
        {pendingPrices.length ? (
          <div className="admin-list">
            {pendingPrices.map((entry) => (
              <article className="card-box admin-record" key={entry.id}>
                <div><h4>{entry.productName} — KSh {entry.price}</h4><p>{entry.supermarket}, {entry.location} · submitted by {entry.submittedBy}</p></div>
                <div className="admin-actions">
                  <button type="button" className="primary-button" disabled={processingId === entry.id} onClick={() => approvePrice(entry.id)}>
                    {processingId === entry.id ? 'Checking stores…' : 'Verify & approve'}
                  </button>
                  <button type="button" className="danger-button" onClick={() => onDeletePrice(entry.id)}>Delete fake price</button>
                </div>
              </article>
            ))}
          </div>
        ) : <p className="empty-state">There are no prices waiting for approval.</p>}
      </section>

      <section className="admin-section">
        <div className="section-heading"><h3>Manage products</h3></div>
        <div className="admin-list">
          {products.map((product) => (
            <article className="card-box admin-record" key={product.id}>
              <div><h4>{product.name}</h4><p>{product.category}</p></div>
              <button type="button" className="danger-button" onClick={() => onDeleteProduct(product.name)}>Delete product</button>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <div className="section-heading"><h3>Approved price records</h3></div>
        <div className="admin-list">
          {prices.filter((entry) => entry.approved).map((entry) => (
            <article className="card-box admin-record" key={entry.id}>
              <div><h4>{entry.productName} — KSh {entry.price}</h4><p>{entry.supermarket}, {entry.location}</p></div>
              <button type="button" className="danger-button" onClick={() => onDeletePrice(entry.id)}>Delete fake price</button>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <div className="section-heading"><h3>Manage users</h3></div>
        <div className="admin-list">
          {users.map((account) => (
            <article className="card-box admin-record" key={account.email}>
              <div><h4>{account.name}</h4><p>{account.email} · {account.role === 'admin' ? 'Administrator' : 'Member'}</p></div>
              {account.email !== currentUser?.email && account.role !== 'admin' && (
                <button type="button" className="danger-button" onClick={() => onDeleteUser(account.email)}>Remove user</button>
              )}
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
