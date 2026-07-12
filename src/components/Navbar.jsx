import { Link } from 'react-router-dom';

export default function Navbar({ user, isLoggedIn, onLogout }) {
  return (
    <nav className="navbar">
      <Link to="/" className="brand"><span aria-hidden="true">✦</span> MarkerTracker</Link>
      <div className="nav-links">
        {isLoggedIn ? (
          <>
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/compare">Compare</Link>
            <Link to="/stores">Shop</Link>
            <Link to="/add-price">Submit Price</Link>
            <Link to="/admin">Admin</Link>
            <span className="navbar-user">{user?.name ?? 'Member'}</span>
            <button className="logout-btn" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
