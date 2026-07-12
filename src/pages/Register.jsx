import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register({ onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!name || !email || !password) {
      setError('Please complete all fields.');
      return;
    }

    const result = onRegister({ name, email, password });
    if (!result.success) {
      setError(result.message);
      return;
    }

    setMessage('Registration complete. Redirecting to dashboard...');
    setTimeout(() => navigate('/dashboard'), 800);
  };

  return (
    <section className="page auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="subtitle">Start contributing grocery prices and tracking trends.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
          <input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && <p className="form-error">{error}</p>}
          {message && <p className="form-message">{message}</p>}
          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account? <Link to="/login" className="text-link">Log in</Link>
        </p>
      </div>
    </section>
  );
}
