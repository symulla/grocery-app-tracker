import { useState } from 'react';

const NEW_PRODUCT_VALUE = '__new_product__';

export default function AddPrice({ supermarkets, products, onSubmit }) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [category, setCategory] = useState('Other essentials');
  const [supermarket, setSupermarket] = useState(supermarkets[0]);
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState('');

  const isNewProduct = selectedProduct === NEW_PRODUCT_VALUE;

  const handleSubmit = (event) => {
    event.preventDefault();
    const productName = isNewProduct ? newProductName.trim() : selectedProduct;

    if (!productName || !price || !location) {
      setMessage('Please complete the product, price, and location fields.');
      return;
    }

    if (isNewProduct && !/\d/.test(productName)) {
      setMessage('Include the pack size, weight, or volume in the product name, e.g. Bella Toilet Paper (4 Pack).');
      return;
    }

    onSubmit({
      productName,
      category: isNewProduct ? category.trim() || 'Other essentials' : undefined,
      supermarket,
      price: Number(price),
      location,
      date,
      submittedBy: 'You',
      approved: false
    });

    setMessage(isNewProduct
      ? `${productName} was added and is ready for admin review. Once approved, its verified supermarket price will appear on Home and Compare.`
      : 'Price submitted for admin review.');
    setSelectedProduct('');
    setNewProductName('');
    setCategory('Other essentials');
    setPrice('');
    setLocation('');
  };

  return (
    <section className="page">
      <h2>Submit a Price</h2>
      <p>Help the community by adding a supermarket price you observed.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-label" htmlFor="product">Product</label>
        <select id="product" value={selectedProduct} onChange={(event) => { setSelectedProduct(event.target.value); setMessage(''); }}>
          <option value="">Select a product</option>
          {products.map((product) => (
            <option key={product.id} value={product.name}>{product.name}</option>
          ))}
          <option value={NEW_PRODUCT_VALUE}>+ Add a new product</option>
        </select>

        {isNewProduct && (
          <div className="new-product-fields">
            <input autoFocus type="text" placeholder="Product name + size, e.g. Bella Toilet Paper (4 Pack)" value={newProductName} onChange={(event) => setNewProductName(event.target.value)} />
            <input type="text" placeholder="Category, e.g. Cooking essentials" value={category} onChange={(event) => setCategory(event.target.value)} />
          </div>
        )}

        <label className="form-label" htmlFor="supermarket">Supermarket</label>
        <select id="supermarket" value={supermarket} onChange={(event) => setSupermarket(event.target.value)}>
          {supermarkets.map((shop) => (
            <option key={shop} value={shop}>{shop}</option>
          ))}
        </select>
        <input type="number" min="0" placeholder="Price in KSh" value={price} onChange={(event) => setPrice(event.target.value)} />
        <input type="text" placeholder="Branch or location" value={location} onChange={(event) => setLocation(event.target.value)} />
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        {message && <p className={message.startsWith('Please') ? 'form-error' : 'form-message'}>{message}</p>}
        <button type="submit">Submit Price</button>
      </form>
    </section>
  );
}
