import { useMemo } from 'react';

export default function Profile({ user, favorites = [] }) {
  const favoriteCount = useMemo(() => favorites.length, [favorites]);

  if (!user) {
    return null;
  }

  return (
    <section className="page profile-page">
      <div className="page-hero">
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="grid">
        <div className="card-box">
          <h3>Favorites</h3>
          <p>{favoriteCount} tracked items</p>
          <ul>
            {favorites.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="card-box">
          <h3>Account status</h3>
          <p>{user.role === 'admin' ? 'Administrator' : 'Community contributor'}</p>
          <p>Profile is stored in Firestore.</p>
        </div>
      </div>
    </section>
  );
}
