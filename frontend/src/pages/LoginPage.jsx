import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg)',
    }}>
      {/* Left panel – branding */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(160deg, var(--green-900) 0%, var(--green-700) 60%, var(--green-500) 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 48, color: '#fff',
        position: 'relative', overflow: 'hidden'
      }} className="auth-panel">
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', width: 500, height: 500,
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
          top: -150, right: -150
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300,
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
          bottom: -80, left: -80
        }} />

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 380 }}>
          <div style={{
            width: 72, height: 72,
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Leaf size={36} color="white" />
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 12, lineHeight: 1.15 }}>
            FarmPredict 360
          </h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.8, lineHeight: 1.6, marginBottom: 40 }}>
            AI-powered agricultural intelligence for smarter farming decisions in Telangana.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
            {[
              { icon: '🌾', title: 'Smart Crop Advisor', desc: 'AI recommendations based on soil & weather' },
              { icon: '📈', title: 'Price Forecasting', desc: 'Predict market prices up to 7 days ahead' },
              { icon: '🔬', title: 'Disease Detection', desc: 'Instantly detect plant diseases from photos' },
            ].map(f => (
              <div key={f.title} style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 12,
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.12)'
              }}>
                <span style={{ fontSize: '1.4rem' }}>{f.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.title}</div>
                  <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div style={{
        width: 460,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 48,
        background: 'var(--surface)'
      }} className="auth-form-panel">
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 6 }}>Welcome back</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '0.92rem' }}>
            Sign in to your FarmPredict 360 account
          </p>

          {error && (
            <div style={{
              padding: '12px 16px', background: 'var(--red-100)',
              border: '1px solid var(--red-400)', borderRadius: 'var(--radius)',
              color: '#991b1b', fontSize: '0.88rem', marginBottom: 20
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  style={{ width: '100%', paddingRight: 44 }}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 0
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <><span className="spinner" />Signing in…</> : <><LogIn size={18} />Sign In</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--green-600)', fontWeight: 600, textDecoration: 'none' }}>
              Sign up free
            </Link>
          </p>

          
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-panel { display: none !important; }
          .auth-form-panel { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
