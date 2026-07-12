import { useMemo } from 'react';

export default function Profile({ user, favorites }) {
  const favoriteCount = useMemo(() => favorites.length, [favorites]);

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
          <p>Community contributor</p>
          <p>Approved submissions count: 5</p>
        </div>
      </div>
    </section>
  );
}
