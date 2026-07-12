const stores = [
  {
    name: 'Carrefour Kenya',
    description: 'Shop groceries, fresh food, household supplies, and more online.',
    url: 'https://www.carrefour.ke/',
    logoLetter: 'C',
    accent: 'carrefour'
  },
  {
    name: 'Naivas Online',
    description: 'Browse Naivas groceries, pantry essentials, and exclusive deals.',
    url: 'https://www.naivas.online/',
    logoLetter: 'N',
    accent: 'naivas'
  },
  {
    name: 'Quickmart',
    description: 'Open Quickmart online shopping for fresh food and everyday supplies.',
    url: 'https://www.quickmart.co.ke/',
    logoLetter: 'Q',
    accent: 'quickmart'
  },
  {
    name: 'Chandarana Foodplus',
    description: 'Visit Foodplus for groceries, fresh foods, bakery, and household items.',
    url: 'https://www.foodplus.co.ke/',
    logoLetter: 'F',
    accent: 'foodplus'
  }
];

export default function Stores() {
  return (
    <section className="page stores-page">
      <div className="page-hero">
        <div>
          <h2>Shop at a supermarket</h2>
          <p>Found a good price? Open the supermarket’s official online store to shop directly.</p>
        </div>
      </div>

      <div className="stores-grid">
        {stores.map((store) => (
          <article className={`store-card store-card--${store.accent}`} key={store.name}>
            <div className="store-card__identity">
              <span className="store-card__mark" aria-hidden="true">
                <img src={`https://www.google.com/s2/favicons?domain_url=${store.url}&sz=128`} alt="" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                <b>{store.logoLetter}</b>
              </span>
              <h3>{store.name}</h3>
            </div>
            <p>{store.description}</p>
            <a href={store.url} target="_blank" rel="noopener noreferrer">Open official store <span aria-hidden="true">→</span></a>
          </article>
        ))}
      </div>
      <p className="stores-note">Retailer availability, delivery areas, prices, and app prompts are managed by each supermarket.</p>
    </section>
  );
}
