'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const url = isLogin
        ? 'http://localhost:4000/api/auth/login'
        : 'http://localhost:4000/api/auth/register';

      const body = isLogin
        ? { email, password }
        : { name, email, password };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <div style={styles.card}>
        {/* Logo */}
        <Link href="/" style={styles.logo}>
          <span style={styles.logoIcon}>⬡</span>
          <span style={styles.logoText}>AI <strong>Verify</strong></span>
        </Link>

        <h1 style={styles.title}>
          {isLogin ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={styles.subtitle}>
          {isLogin ? 'Sign in to your account' : 'Start detecting plagiarism'}
        </p>

        {error && <div style={styles.error}>{error}</div>}

        {!isLogin && (
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Sudiksha Singh"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
        )}

        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <button
          style={{...styles.btn, opacity: loading ? 0.7 : 1}}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>

        <p style={styles.toggle}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span
            style={styles.toggleLink}
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles: any = {
  page: { minHeight: '100vh', background: '#07070f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative' },
  bgGlow1: { position: 'fixed', top: '-200px', left: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)', pointerEvents: 'none' },
  bgGlow2: { position: 'fixed', bottom: '-200px', right: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)', pointerEvents: 'none' },
  card: { width: '100%', maxWidth: '420px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '40px', backdropFilter: 'blur(10px)' },
  logo: { display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'white', marginBottom: '32px' },
  logoIcon: { fontSize: '20px', color: '#818cf8' },
  logoText: { fontSize: '16px', color: 'white' },
  title: { fontSize: '24px', fontWeight: '700', color: 'white', margin: '0 0 8px' },
  subtitle: { fontSize: '14px', color: '#666', margin: '0 0 28px' },
  error: { background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: '8px', padding: '12px', color: '#ff4d6d', fontSize: '14px', marginBottom: '20px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', color: '#888', marginBottom: '6px', fontWeight: '500' },
  input: { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #818cf8, #6366f1)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px', marginBottom: '20px' },
  toggle: { textAlign: 'center', fontSize: '14px', color: '#666', margin: 0 },
  toggleLink: { color: '#818cf8', cursor: 'pointer', fontWeight: '600' },
};