import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const NEW_PRODUCT_VALUE = '__new_product__';

export default function AddPrice({ supermarkets, products, currentUser }) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [category, setCategory] = useState('Other essentials');
  const [supermarket, setSupermarket] = useState(supermarkets[0]);
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState('');

  const isNewProduct = selectedProduct === NEW_PRODUCT_VALUE;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const productName = isNewProduct
      ? newProductName.trim()
      : selectedProduct;

    if (!productName || !price || !location) {
      setMessage('Please complete the product, price, and location fields.');
      return;
    }

    if (isNewProduct && !/\d/.test(productName)) {
      setMessage(
        'Include the pack size, weight, or volume in the product name, e.g. Bella Toilet Paper (4 Pack).'
      );
      return;
    }

    try {
      await addDoc(collection(db, 'prices'), {
        productName,
        category: isNewProduct
          ? category.trim() || 'Other essentials'
          : 'Existing Product',
        supermarket,
        price: Number(price),
        location,
        date,
        submittedBy: currentUser?.name || auth.currentUser?.email || 'You',
        submittedByUid: currentUser?.uid || auth.currentUser?.uid || null,
        approved: false,
        reviewed: false,
        createdAt: serverTimestamp(),
      });

      setMessage(
        isNewProduct
          ? `${productName} was added successfully and is awaiting admin approval.`
          : 'Price submitted successfully and is awaiting admin approval.'
      );

      setSelectedProduct('');
      setNewProductName('');
      setCategory('Other essentials');
      setPrice('');
      setLocation('');
      setDate(new Date().toISOString().slice(0, 10));
    } catch (error) {
      console.error('Firestore Error:', error);
      setMessage('Failed to submit the price. Please try again.');
    }
  };

  return (
    <section className="page">
      <h2>Submit a Price</h2>
      <p>Help the community by adding a supermarket price you observed.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-label" htmlFor="product">
          Product
        </label>

        <select
          id="product"
          value={selectedProduct}
          onChange={(event) => {
            setSelectedProduct(event.target.value);
            setMessage('');
          }}
        >
          <option value="">Select a product</option>

          {products.map((product) => (
            <option key={product.id} value={product.name}>
              {product.name}
            </option>
          ))}

          <option value={NEW_PRODUCT_VALUE}>+ Add a new product</option>
        </select>

        {isNewProduct && (
          <div className="new-product-fields">
            <input
              autoFocus
              type="text"
              placeholder="Product name + size, e.g. Bella Toilet Paper (4 Pack)"
              value={newProductName}
              onChange={(event) => setNewProductName(event.target.value)}
            />

            <input
              type="text"
              placeholder="Category, e.g. Cooking essentials"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
          </div>
        )}

        <label className="form-label" htmlFor="supermarket">
          Supermarket
        </label>

        <select
          id="supermarket"
          value={supermarket}
          onChange={(event) => setSupermarket(event.target.value)}
        >
          {supermarkets.map((shop) => (
            <option key={shop} value={shop}>
              {shop}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          placeholder="Price in KSh"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
        />

        <input
          type="text"
          placeholder="Branch or location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />

        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />

        {message && (
          <p
            className={
              message.startsWith('Please') || message.startsWith('Failed')
                ? 'form-error'
                : 'form-message'
            }
          >
            {message}
          </p>
        )}

        <button type="submit">Submit Price</button>
      </form>
    </section>
  );
}