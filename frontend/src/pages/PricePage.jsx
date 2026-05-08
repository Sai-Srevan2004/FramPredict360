import { useState, useEffect } from 'react';
import Layout from '../components/dashboard/Layout';
import api from '../utils/api';
import { io } from 'socket.io-client';
import { TrendingUp, TrendingDown, Minus, Bell, BellOff, Loader2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, Area, AreaChart
} from 'recharts';

const TREND_STYLES = {
  Bullish:  { color: 'var(--green-600)', bg: 'var(--green-50)',  border: 'var(--green-300)', icon: TrendingUp,   label: '📈 Bullish' },
  Bearish:  { color: 'var(--red-500)',   bg: 'var(--red-100)',   border: 'var(--red-400)',   icon: TrendingDown, label: '📉 Bearish' },
  Stable:   { color: 'var(--amber-500)', bg: 'var(--amber-100)', border: '#fde68a',          icon: Minus,        label: '➡️ Stable' },
};

function PriceStat({ label, value, sub }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '10px 14px', fontSize: '0.8rem',
      boxShadow: 'var(--shadow-md)'
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: ₹{Number(p.value).toFixed(0)}/q
        </div>
      ))}
    </div>
  );
};

export default function PricePage() {
  const [districts, setDistricts] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [crops, setCrops] = useState([]);
  const [form, setForm] = useState({ district: '', market: '', crop: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    api.get('/price/districts').then(r => setDistricts(r.data.data?.districts || [])).catch(() => {});
    api.get('/price/crops').then(r => setCrops(r.data.data?.crops || [])).catch(() => {});
    const s = io('/', { transports: ['websocket'] });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (!form.district) return;
    api.get(`/price/markets/${form.district}`)
      .then(r => { setMarkets(r.data.data?.markets || []); setForm(p => ({ ...p, market: '' })); })
      .catch(() => {});
  }, [form.district]);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/price/predict', form);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Prediction failed. Ensure FastAPI service is running.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscribe = () => {
    if (!socket || !result) return;
    if (!subscribed) {
      socket.emit('subscribe_price_alerts', { crop: result.crop, district: result.district });
      setSubscribed(true);
    } else {
      socket.emit('unsubscribe_price_alerts', { crop: result.crop, district: result.district });
      setSubscribed(false);
    }
  };

  // Combine historical + forecast for chart
  const chartData = result ? [
    ...result.historical_prices.map(p => ({
      date: p.date.slice(5), // MM-DD
      'Min Price': p.min_price,
      'Max Price': p.max_price,
      'Modal Price': p.modal_price,
      type: 'historical'
    })),
    {
      date: result.tomorrow_prediction?.date?.slice(5) + ' (Tomorrow)',
      'Min Price': result.tomorrow_prediction?.min_price,
      'Max Price': result.tomorrow_prediction?.max_price,
      'Modal Price': result.tomorrow_prediction?.modal_price,
      type: 'tomorrow'
    },
    ...(result.week_forecast || []).map(p => ({
      date: p.date.slice(5),
      'Min Price': p.min_price,
      'Max Price': p.max_price,
      'Modal Price': p.modal_price,
      type: 'forecast'
    }))
  ] : [];

  const trend = result?.trend ? TREND_STYLES[result.trend] || TREND_STYLES.Stable : null;

  return (
    <Layout>
      <div className="animate-fadeInUp">
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 4 }}>📈 Price Forecast</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            AI-powered crop price predictions for Telangana markets
          </p>
        </div>

        {/* Form */}
        <div className="card" style={{ marginBottom: 24 }}>
          <form onSubmit={handleSubmit}>
            <div className="grid-3" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">District</label>
                <select className="form-input form-select" value={form.district} onChange={set('district')} required>
                  <option value="">Select district…</option>
                  {districts.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Market (APMC)</label>
                <select className="form-input form-select" value={form.market} onChange={set('market')} required disabled={!form.district}>
                  <option value="">Select market…</option>
                  {markets.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Crop</label>
                <select className="form-input form-select" value={form.crop} onChange={set('crop')} required>
                  <option value="">Select crop…</option>
                  {crops.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', background: 'var(--red-100)',
                border: '1px solid var(--red-400)', borderRadius: 'var(--radius)',
                color: '#991b1b', fontSize: '0.86rem', marginBottom: 14
              }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading
                  ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />Analysing market…</>
                  : <><TrendingUp size={16} />Predict Prices</>
                }
              </button>

            </div>
          </form>
        </div>

        {result && (
          <div className="animate-fadeIn">
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                {result.crop} — {result.market}, {result.district}
              </h3>
              {trend && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px', borderRadius: 99,
                  background: trend.bg, border: `1px solid ${trend.border}`,
                  color: trend.color, fontSize: '0.82rem', fontWeight: 700
                }}>
                  {trend.label}
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="grid-4" style={{ marginBottom: 20 }}>
              <PriceStat
                label="Tomorrow Min"
                value={`₹${result.tomorrow_prediction?.min_price?.toFixed(0)}`}
                sub="per quintal"
              />
              <PriceStat
                label="Tomorrow Max"
                value={`₹${result.tomorrow_prediction?.max_price?.toFixed(0)}`}
                sub="per quintal"
              />
              <PriceStat
                label="Tomorrow Modal"
                value={`₹${result.tomorrow_prediction?.modal_price?.toFixed(0)}`}
                sub="expected price"
              />
              <PriceStat
                label="7-Day Avg Modal"
                value={`₹${result.week_forecast?.length
                  ? (result.week_forecast.reduce((a, p) => a + p.modal_price, 0) / result.week_forecast.length).toFixed(0)
                  : '--'}`}
                sub="forecast average"
              />
            </div>

            {/* Chart */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>
                📊 Price Trend: Past 7 Days + Forecast
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="maxGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--green-500)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--green-500)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <ReferenceLine x={chartData[6]?.date} stroke="var(--amber-500)" strokeDasharray="5 5" label={{ value: 'Today', fontSize: 10 }} />
                  <Area type="monotone" dataKey="Max Price" stroke="var(--green-500)" fill="url(#maxGrad)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Modal Price" stroke="var(--green-700)" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Min Price" stroke="var(--amber-500)" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Insight + Recommendation */}
            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="card" style={{ background: 'var(--green-50)', border: '1px solid var(--green-300)' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--green-800)', marginBottom: 8 }}>
                  🔍 Market Insight
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {result.price_insight}
                </p>
              </div>
              <div className="card" style={{ background: 'var(--amber-100)', border: '1px solid #fde68a' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.88rem', color: '#92400e', marginBottom: 8 }}>
                  💡 Recommendation
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {result.recommendation}
                </p>
              </div>
            </div>

            {/* Week forecast table */}
            <div className="card">
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14 }}>
                📅 7-Day Price Forecast
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)' }}>
                      {['Date', 'Min Price (₹/q)', 'Modal Price (₹/q)', 'Max Price (₹/q)'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Tomorrow row highlighted */}
                    <tr style={{ background: 'var(--green-50)', fontWeight: 600 }}>
                      <td style={{ padding: '9px 14px', borderTop: '1px solid var(--border)' }}>
                        {result.tomorrow_prediction?.date} <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Tomorrow</span>
                      </td>
                      <td style={{ padding: '9px 14px', borderTop: '1px solid var(--border)' }}>₹{result.tomorrow_prediction?.min_price?.toFixed(0)}</td>
                      <td style={{ padding: '9px 14px', borderTop: '1px solid var(--border)' }}>₹{result.tomorrow_prediction?.modal_price?.toFixed(0)}</td>
                      <td style={{ padding: '9px 14px', borderTop: '1px solid var(--border)' }}>₹{result.tomorrow_prediction?.max_price?.toFixed(0)}</td>
                    </tr>
                    {result.week_forecast?.map((p, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)' }}>
                        <td style={{ padding: '9px 14px', borderTop: '1px solid var(--border)' }}>{p.date}</td>
                        <td style={{ padding: '9px 14px', borderTop: '1px solid var(--border)' }}>₹{p.min_price?.toFixed(0)}</td>
                        <td style={{ padding: '9px 14px', borderTop: '1px solid var(--border)' }}>₹{p.modal_price?.toFixed(0)}</td>
                        <td style={{ padding: '9px 14px', borderTop: '1px solid var(--border)' }}>₹{p.max_price?.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
