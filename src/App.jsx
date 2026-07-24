import { useMemo, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  addDoc,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
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
import { initialProducts, initialSupermarkets } from './data/seedData';
import { auth, db } from './firebase';

function App() {
  const [prices, setPrices] = useState([]);
  const [products, setProducts] = useState(() => {
    const stored = localStorage.getItem('grocery-products');
    return stored ? JSON.parse(stored) : initialProducts;
  });
  const [supermarkets] = useState(initialSupermarkets);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const isAuthScreen = !isLoggedIn && (location.pathname === '/' || location.pathname === '/login');

  const latestPrices = useMemo(() => {
    return prices.filter((price) => price.approved);
  }, [prices]);

  useEffect(() => {
    const pricesQuery = query(collection(db, 'prices'), orderBy('createdAt', 'desc'));
    const unsubscribePrices = onSnapshot(pricesQuery, (snapshot) => {
      const nextPrices = snapshot.docs.map((document) => ({
        ...document.data(),
        id: document.id,
      }));

      setPrices(nextPrices);
    }, (error) => {
      console.error('Failed to load prices from Firestore:', error);
    });

    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const nextUsers = snapshot.docs.map((document) => ({
        ...document.data(),
        uid: document.id,
      }));

      setUsers(nextUsers);
    }, (error) => {
      console.error('Failed to load users from Firestore:', error);
    });

    return () => {
      unsubscribePrices();
      unsubscribeUsers();
    };
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setIsLoggedIn(false);
        setUser(null);
        setFavorites([]);
        return;
      }

      setIsLoggedIn(true);

      const profileRef = doc(db, 'users', firebaseUser.uid);
      const snapshot = await getDoc(profileRef);

      if (!snapshot.exists()) {
        const fallbackProfile = {
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member',
          email: firebaseUser.email,
          favorites: [],
          role: 'user',
          createdAt: serverTimestamp(),
        };

        await setDoc(profileRef, fallbackProfile);
        setUser({ uid: firebaseUser.uid, ...fallbackProfile });
        setFavorites([]);
        return;
      }

      const profile = snapshot.data();
      const hydratedUser = {
        uid: firebaseUser.uid,
        name: profile.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member',
        email: profile.email || firebaseUser.email,
        favorites: profile.favorites || [],
        role: profile.role || 'user',
      };

      setUser(hydratedUser);
      setFavorites(hydratedUser.favorites || []);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    localStorage.setItem('grocery-products', JSON.stringify(products));
  }, [products]);

  const handleSubmitPrice = async (newEntry) => {
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

    await addDoc(collection(db, 'prices'), {
      ...newEntry,
      submittedBy: user?.name || auth.currentUser?.email || 'Guest',
      submittedByUid: user?.uid || auth.currentUser?.uid || null,
      approved: false,
      reviewed: false,
      createdAt: serverTimestamp(),
    });
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

    await updateDoc(doc(db, 'prices', priceId), {
      approved: true,
      reviewed: true,
      approvedAt: serverTimestamp(),
      source: result.prices[0].sourceUrl || '',
      sourceUrl: result.prices[0].sourceUrl || '',
      checkedAt: result.prices[0].checkedAt || null,
    });
  };

  const handleDeletePrice = async (priceId) => {
    await deleteDoc(doc(db, 'prices', priceId));
  };

  const handleDeleteUser = async (uid) => {
    await deleteDoc(doc(db, 'users', uid));
  };

  const handleDeleteProduct = (productName) => {
    setProducts((current) => current.filter((product) => product.name !== productName));
  };

  const handleLogin = async ({ email, password }) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.code === 'auth/invalid-credential'
          ? 'Invalid email or password. Please try again.'
          : error.message,
      };
    }
  };

  const handleRegister = async ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      const profileRef = doc(db, 'users', credential.user.uid);
      await setDoc(profileRef, {
        name,
        email: normalizedEmail,
        favorites: [],
        role: 'user',
        createdAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        return { success: false, message: 'This email is already registered.' };
      }

      return {
        success: false,
        message: error.message || 'Registration failed. Please try again.',
      };
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsLoggedIn(false);
    setUser(null);
    setFavorites([]);
  };

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
                <AddPrice supermarkets={supermarkets} products={products} currentUser={user} />
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
