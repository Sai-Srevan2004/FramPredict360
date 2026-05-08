import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Eye, EyeOff, UserPlus } from 'lucide-react';

const DISTRICTS = [
  'Hyderabad','Warangal','Nizamabad','Karimnagar','Khammam',
  'Nalgonda','Mahbubnagar','Medak','Adilabad','Rangareddy',
  'Sangareddy','Siddipet','Jagtial','Peddapalli','Mancherial'
];

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'farmer', district: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role, form.district);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', padding: 24
    }}>
      <div style={{
        width: '100%', maxWidth: 520,
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--green-900), var(--green-700))',
          padding: '28px 32px',
          display: 'flex', alignItems: 'center', gap: 14
        }}>
          <div style={{
            width: 44, height: 44, background: 'rgba(255,255,255,0.15)',
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Leaf size={22} color="white" />
          </div>
          <div>
            <h1 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800 }}>FarmPredict 360</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>Create your free account</p>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '28px 32px' }}>
          {error && (
            <div style={{
              padding: '11px 14px', background: 'var(--red-100)',
              border: '1px solid var(--red-400)', borderRadius: 'var(--radius)',
              color: '#991b1b', fontSize: '0.86rem', marginBottom: 18
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Your full name" value={form.name} onChange={set('name')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input form-select" value={form.role} onChange={set('role')}>
                  <option value="farmer">Farmer</option>
                  <option value="trader">Trader</option>
                  <option value="agribusiness">Agribusiness</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>

            <div className="form-group">
              <label className="form-label">District (Telangana)</label>
              <select className="form-input form-select" value={form.district} onChange={set('district')}>
                <option value="">Select your district</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Min 6 characters"
                    style={{ width: '100%', paddingRight: 40 }}
                    value={form.password} onChange={set('password')} required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0
                  }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password" className="form-input" placeholder="Repeat password"
                  value={form.confirmPassword} onChange={set('confirmPassword')} required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <><span className="spinner" />Creating account…</> : <><UserPlus size={18} />Create Account</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--green-600)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
