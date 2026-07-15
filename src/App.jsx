import { useMemo, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddPrice from './pages/AddPrice';
import Compare from './pages/Compare';
import Stores from './pages/Stores';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import { initialPrices, initialProducts, initialSupermarkets } from './data/seedData';

function App() {
  const defaultUser = {
    name: 'Sylvia',
    email: 'sylvia@example.com',
    password: 'demo123',
    favorites: ['Cooking Oil', '2kg Rice', 'Sugar'],
    role: 'user'
  };
  const defaultAdmin = { name: 'Market Team', email: 'market@markertracker.com', password: 'demo123', favorites: [], role: 'admin' };

  const [prices, setPrices] = useState(() => {
    const stored = localStorage.getItem('grocery-prices');
    return stored ? JSON.parse(stored) : initialPrices;
  });
  const [products, setProducts] = useState(() => {
    const stored = localStorage.getItem('grocery-products');
    return stored ? JSON.parse(stored) : initialProducts;
  });
  const [supermarkets] = useState(initialSupermarkets);
  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem('grocery-users');
    if (!stored) return [defaultAdmin, defaultUser];
    const savedUsers = JSON.parse(stored);
    return savedUsers.some((entry) => entry.role === 'admin') ? savedUsers : [defaultAdmin, ...savedUsers];
  });
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('grocery-user');
    return stored ? JSON.parse(stored) : null;
  });
  const [favorites, setFavorites] = useState(() => {
    const storedFavorites = localStorage.getItem('grocery-favorites');
    if (storedFavorites) return JSON.parse(storedFavorites);

    const storedUser = localStorage.getItem('grocery-user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      return parsedUser.favorites ?? defaultUser.favorites;
    }

    return defaultUser.favorites;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('grocery-isLoggedIn') === 'true');
  const location = useLocation();
  const isAuthScreen = !isLoggedIn && (location.pathname === '/' || location.pathname === '/login');

  const latestPrices = useMemo(() => {
    return prices.filter((price) => price.approved);
  }, [prices]);

  const handleSubmitPrice = (newEntry) => {
    setProducts((current) => {
      const exists = current.some((product) => product.name.toLowerCase() === newEntry.productName.toLowerCase());
      if (exists) return current;

      return [
        ...current,
        {
          id: `product-${Date.now()}`,
          name: newEntry.productName,
          category: newEntry.category || 'Other essentials'
        }
      ];
    });

    setPrices((current) => [
      { ...newEntry, id: Date.now(), submittedBy: user?.name ?? 'Guest', approved: false },
      ...current
    ]);
  };

  const handleApprovePrice = async (priceId) => {
    const submittedPrice = prices.find((entry) => entry.id === priceId);
    if (!submittedPrice) throw new Error('This submission is no longer available.');

    const response = await fetch('/api/price-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName: submittedPrice.productName })
    });
    const responseBody = await response.text();
    let result;
    try {
      result = responseBody ? JSON.parse(responseBody) : {};
    } catch {
      throw new Error('Online verification is unavailable. Restart the development server with “npm run dev” and try again.');
    }
    if (!responseBody) {
      throw new Error('Online verification is unavailable. Restart the development server with “npm run dev” and try again.');
    }
    if (!response.ok) throw new Error(result.error || 'The online price lookup failed.');
    if (!result.prices.length) {
      throw new Error('The online stores could not confirm a current exact listing. This can happen when an item is out of stock, a branch has not been selected, or a store blocks the lookup. Your product name may still be correct.');
    }

    setPrices((current) => [
      ...result.prices.map((listing, index) => ({
        id: `online-${Date.now()}-${index}`,
        productName: submittedPrice.productName,
        supermarket: listing.supermarket,
        price: listing.price,
        location: 'Online store',
        date: listing.checkedAt.slice(0, 10),
        source: `${listing.supermarket} online store`,
        sourceUrl: listing.sourceUrl,
        submittedBy: 'MarkerTracker online verification',
        approved: true,
        checkedAt: listing.checkedAt
      })),
      ...current.map((entry) => entry.id === priceId ? { ...entry, reviewed: true } : entry)
    ]);
  };
  const handleDeletePrice = (priceId) => setPrices((current) => current.filter((entry) => entry.id !== priceId));
  const handleDeleteUser = (email) => setUsers((current) => current.filter((entry) => entry.email !== email));
  const handleDeleteProduct = (productName) => {
    setProducts((current) => current.filter((product) => product.name !== productName));
    setPrices((current) => current.filter((entry) => entry.productName !== productName));
  };

  const handleLogin = ({ email, password }) => {
    const normalizedEmail = email.toLowerCase();
    const match = users.find((entry) => entry.email === normalizedEmail && entry.password === password);

    if (!match) {
      return false;
    }

    setUser(match);
    setFavorites(match.favorites ?? []);
    setIsLoggedIn(true);
    return true;
  };

  const handleRegister = ({ name, email, password }) => {
    const normalizedEmail = email.toLowerCase();
    if (users.some((entry) => entry.email === normalizedEmail)) {
      return { success: false, message: 'This email is already registered.' };
    }

    const newUser = {
      name,
      email: normalizedEmail,
      password,
      favorites: [],
      role: 'user'
    };

    setUsers((current) => [newUser, ...current]);
    setUser(newUser);
    setFavorites([]);
    setIsLoggedIn(true);

    return { success: true };
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setFavorites([]);
    localStorage.removeItem('grocery-user');
    localStorage.removeItem('grocery-favorites');
    localStorage.setItem('grocery-isLoggedIn', 'false');
  };

  useEffect(() => {
    localStorage.setItem('grocery-users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('grocery-products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('grocery-prices', JSON.stringify(prices));
  }, [prices]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('grocery-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('grocery-user');
    }
    localStorage.setItem('grocery-isLoggedIn', isLoggedIn ? 'true' : 'false');
    localStorage.setItem('grocery-favorites', JSON.stringify(favorites));
  }, [user, favorites, isLoggedIn]);

  return (
    <div className="app-shell">
      {!isAuthScreen && <Navbar user={user} isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
      <main className={isAuthScreen ? 'page-content page-content--login' : 'page-content'}>
        <Routes>
          <Route
            path="/"
            element={isLoggedIn ? <Home products={products} prices={latestPrices} /> : <Login onLogin={handleLogin} />}
          />
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />}
          />
          <Route
            path="/register"
            element={isLoggedIn ? <Navigate to="/" replace /> : <Register onRegister={handleRegister} />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isLoggedIn}>
                <Dashboard prices={latestPrices} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-price"
            element={
              <ProtectedRoute isAuthenticated={isLoggedIn}>
                <AddPrice supermarkets={supermarkets} products={products} onSubmit={handleSubmitPrice} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare"
            element={
              <ProtectedRoute isAuthenticated={isLoggedIn}>
                <Compare prices={latestPrices} products={products} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stores"
            element={
              <ProtectedRoute isAuthenticated={isLoggedIn}>
                <Stores />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={isLoggedIn}>
                <Profile user={user} favorites={favorites} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute isAuthenticated={isLoggedIn} user={user} requireAdmin>
                <Admin prices={prices} products={products} users={users} currentUser={user}
                  onApprovePrice={handleApprovePrice} onDeletePrice={handleDeletePrice}
                  onDeleteUser={handleDeleteUser} onDeleteProduct={handleDeleteProduct} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isAuthScreen && <Footer />}
    </div>
  );
}

export default App;
