import { useEffect, useState } from 'react';

function formatSyncedAt(value) {
  if (!value) return 'Waiting for the first retailer sync';
  return `Last synced ${new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))}`;
}

export default function LiveOffers() {
  const [feed, setFeed] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    const loadOffers = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/current-offers.json?updated=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Offer feed is unavailable.');
        const data = await response.json();
        if (isMounted) {
          setFeed(data);
          setStatus('ready');
        }
      } catch {
        if (isMounted) setStatus('error');
      }
    };

    loadOffers();
    const timer = setInterval(loadOffers, 5 * 60_000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  if (status === 'loading') return <p className="offers-status">Checking the latest official store offers…</p>;
  if (status === 'error') return <p className="offers-status">Live offers are temporarily unavailable. Use Shop to check each retailer directly.</p>;

  const activeStores = feed.stores?.filter((store) => store.offers?.length) ?? [];

  return (
    <section className="live-offers" aria-labelledby="live-offers-title">
      <div className="live-offers__heading">
        <div>
          <p className="eyebrow">Official retailer offers</p>
          <h2 id="live-offers-title">Latest discounts</h2>
        </div>
        <span>{formatSyncedAt(feed.syncedAt)}</span>
      </div>

      {activeStores.length ? (
        <div className="live-offers__grid">
          {activeStores.map((store) => (
            <article className="offer-store" key={store.id}>
              <div className="offer-store__title"><h3>{store.name}</h3>{store.stale && <small>Last successful sync</small>}</div>
              <ul>
                {store.offers.map((offer) => <li key={`${offer.productName}-${offer.price}`}><span>{offer.productName}</span><b>KSh {offer.price.toLocaleString()}</b></li>)}
              </ul>
              <a href={store.offersUrl} target="_blank" rel="noopener noreferrer">View current offers →</a>
            </article>
          ))}
        </div>
      ) : (
        <p className="offers-status">{feed.stores?.map((store) => store.notice).filter(Boolean).join(' ') || 'No public offers are available yet.'}</p>
      )}
    </section>
  );
}
