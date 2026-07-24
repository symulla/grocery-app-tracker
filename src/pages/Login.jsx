import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await onLogin({ email, password });
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <section className="page auth-page auth-login-page">
      <div className="login-split-panel">
      <div className="login-glass-card">
        <div className="login-brand-header">
          <div className="login-brand__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none"><path d="M16 27V13M16 18 9 14v10l7 3 7-3V14l-7 4Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M8.5 10.5C5 8.5 5.7 4.8 10 5.6c.4 3.8-.7 5.6-3.5 4.9Zm15 0c2.8.7 3.9-1.1 3.5-4.9-4.3-.8-5 2.9-3.5 4.9Z" fill="currentColor" /></svg>
          </div>
          <div>
            <h1 className="login-brand__name">MarkerTracker</h1>
            <p className="login-brand__tag">Track. Save. Eat Fresh.</p>
          </div>
        </div>

        <div className="login-header">
          <h2>Welcome Back!</h2>
          <p className="subtitle">Log in to manage your groceries and freshness.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field-group">
            <label htmlFor="email">Email address</label>
            <div className="field-input-wrapper">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4zM4 7l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <input id="email" type="email" placeholder="yourname@email.com" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
          </div>

          <div className="auth-field-group">
            <label htmlFor="password">Password</label>
            <div className="field-input-wrapper">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
              </button>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}
          <button className="primary-button auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Log in'} <span className="submit-icon">→</span>
          </button>
        </form>

        <div className="login-actions"><Link to="/forgot-password" className="text-button forgot-link">Forgot password?</Link></div>

        <p className="login-footer">Don&apos;t have an account? <Link to="/register" className="text-link">Sign up</Link></p>
      </div>
      <aside className="supermarket-visual" aria-label="Supermarket supplies including cooking oil, milk, sugar, salt and canned goods">
        <div className="supermarket-visual__copy">
          <span>Compare smarter</span>
          <strong>Find better prices on everyday supplies.</strong>
        </div>
        <div className="price-watch-card">
          <div className="price-watch-card__heading">
            <div><span>Price watch</span><strong>Cooking oil · 1L</strong></div>
            <b>Prices?</b>
          </div>
          <svg className="price-watch-chart" viewBox="0 0 320 86" role="img" aria-label="Example price comparison chart">
            <path d="M4 70C40 67 44 42 82 47s47 21 78 4 37-38 72-27 53 7 84-19" fill="none" stroke="#a8e66a" strokeWidth="4" strokeLinecap="round" />
            <path d="M4 70C40 67 44 42 82 47s47 21 78 4 37-38 72-27 53 7 84-19V86H4Z" fill="rgba(168,230,106,0.18)" />
            <circle cx="316" cy="5" r="5" fill="#d8ffb5" />
          </svg>
          <div className="price-watch-stores">
            <span><b>Carrefour</b><em>KSh 318</em></span>
            <span><b>Quickmart</b><em>KSh 329</em></span>
            <span><b>Naivas</b><em>KSh 335</em></span>
          </div>
        </div>
      </aside>
      </div>
    </section>
  );
}
