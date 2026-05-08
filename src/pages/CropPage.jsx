import { useState, useEffect } from 'react';
import Layout from '../components/dashboard/Layout';
import api from '../utils/api';
import { Sprout, MapPin, FlaskConical, Loader2, ThumbsUp, Cloud, Leaf } from 'lucide-react';

const DEFAULT = {
  latitude: 17.385, longitude: 78.486,
  soil_type: 'Loamy', previous_crop: 'Wheat',
  nitrogen: 45, phosphorus: 25, potassium: 75,
  ph_level: 6.5, organic_matter: 2.0, mode: 'recommend'
};

function ScoreBar({ score }) {
  const pct = (score / 10) * 100;
  const color = score >= 7 ? 'var(--green-500)' : score >= 5 ? 'var(--amber-500)' : 'var(--red-500)';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Soil Health Score</span>
        <span style={{ fontWeight: 800, fontSize: '1rem', color }}>{score}/10</span>
      </div>
      <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 1s ease' }} />
      </div>
    </div>
  );
}

function CropCard({ rec, rank }) {
  const confidencePct = Math.round(rec.confidence * 100);
  return (
    <div className="card" style={{
      border: rank === 0 ? '2px solid var(--green-400)' : '1px solid var(--border)',
      position: 'relative', overflow: 'hidden'
    }}>
      {rank === 0 && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: 'var(--green-500)', color: '#fff',
          fontSize: '0.7rem', fontWeight: 700,
          padding: '3px 10px', borderBottomLeftRadius: 8
        }}>
          #1 BEST MATCH
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 44, height: 44, background: 'var(--green-50)',
          borderRadius: 12, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0
        }}>
          🌱
        </div>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{rec.crop_name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <div style={{
              height: 6, width: 80, background: 'var(--border)', borderRadius: 99, overflow: 'hidden'
            }}>
              <div style={{
                height: '100%', width: `${confidencePct}%`,
                background: confidencePct >= 80 ? 'var(--green-500)' : 'var(--amber-500)',
                borderRadius: 99
              }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{confidencePct}% match</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem' }}>
        {[
          { label: '📝 Reason', val: rec.reason },
          { label: '📦 Expected Yield', val: rec.expected_yield },
          { label: '📅 Sowing Time', val: rec.best_sowing_time },
          { label: '💧 Water Need', val: rec.water_requirement },
          { label: '🌿 Fertilizer Tips', val: rec.fertilizer_tips },
        ].map(({ label, val }) => (
          <div key={label} style={{
            padding: '7px 10px', background: 'var(--surface-2)',
            borderRadius: 8, lineHeight: 1.5
          }}>
            <strong style={{ color: 'var(--text-secondary)' }}>{label}:</strong>{' '}
            <span style={{ color: 'var(--text-primary)' }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CropPage() {
  const [form, setForm] = useState(DEFAULT);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [soilTypes, setSoilTypes] = useState([]);
  const [prevCrops, setPrevCrops] = useState([]);

  useEffect(() => {
    api.get('/crop/soil-types').then(r => setSoilTypes(r.data.data?.soil_types || [])).catch(() => {});
    api.get('/crop/common-crops').then(r => setPrevCrops(r.data.data?.crops || [])).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/crop/predict', form);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Prediction failed. Ensure FastAPI service is running.');
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      setForm(p => ({ ...p, latitude: parseFloat(pos.coords.latitude.toFixed(4)), longitude: parseFloat(pos.coords.longitude.toFixed(4)) }));
    });
  };

  return (
    <Layout>
      <div className="animate-fadeInUp">
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 4 }}>🌱 Crop Advisor</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Enter your soil and location data to get AI-powered crop recommendations
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: result ? '420px 1fr' : '1fr', gap: 24, alignItems: 'start' }}>
          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <MapPin size={16} color="var(--green-600)" />
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Location</h3>
                <button type="button" onClick={useMyLocation} className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }}>
                  📍 Use My Location
                </button>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input type="number" step="0.0001" className="form-input" value={form.latitude} onChange={set('latitude')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input type="number" step="0.0001" className="form-input" value={form.longitude} onChange={set('longitude')} required />
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Leaf size={16} color="var(--green-600)" />
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Soil & Crop Info</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Soil Type</label>
                    <select className="form-input form-select" value={form.soil_type} onChange={set('soil_type')}>
                      {soilTypes.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Previous Crop</label>
                    <select className="form-input form-select" value={form.previous_crop} onChange={set('previous_crop')}>
                      {prevCrops.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <FlaskConical size={16} color="var(--green-600)" />
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Soil Nutrients</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="grid-3">
                  {[
                    { k: 'nitrogen', label: 'Nitrogen (N)', unit: 'kg/ha', max: 200 },
                    { k: 'phosphorus', label: 'Phosphorus (P)', unit: 'kg/ha', max: 200 },
                    { k: 'potassium', label: 'Potassium (K)', unit: 'kg/ha', max: 200 },
                  ].map(({ k, label, unit, max }) => (
                    <div key={k} className="form-group">
                      <label className="form-label">{label}</label>
                      <input type="number" step="0.1" min="0" max={max} className="form-input" value={form[k]} onChange={set(k)} required />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{unit}</span>
                    </div>
                  ))}
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">pH Level</label>
                    <input type="number" step="0.1" min="0" max="14" className="form-input" value={form.ph_level} onChange={set('ph_level')} required />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>0–14 scale</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Organic Matter</label>
                    <input type="number" step="0.1" min="0" max="10" className="form-input" value={form.organic_matter} onChange={set('organic_matter')} required />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>percentage %</span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '11px 14px', background: 'var(--red-100)',
                border: '1px solid var(--red-400)', borderRadius: 'var(--radius)',
                color: '#991b1b', fontSize: '0.86rem', marginBottom: 12
              }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading
                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />Analysing with AI…</>
                : <><Sprout size={18} />Get Crop Recommendations</>
              }
            </button>
          </form>

          {/* Results */}
          {result && (
            <div className="animate-fadeIn">
              {/* Weather card */}
              <div className="card" style={{ marginBottom: 16, background: 'linear-gradient(135deg, #e0f2fe, #f0fdf4)', border: '1px solid #bae6fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Cloud size={16} color="var(--blue-500)" />
                  <h3 style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--blue-500)' }}>
                    Live Weather – {result.location_name}
                  </h3>
                  <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>{result.season}</span>
                </div>
                <div className="grid-4">
                  {[
                    { label: 'Temp', val: `${result.weather_summary?.temperature}°C` },
                    { label: 'Humidity', val: `${result.weather_summary?.humidity}%` },
                    { label: 'Wind', val: `${result.weather_summary?.wind_speed} km/h` },
                    { label: 'Condition', val: result.weather_summary?.description },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{val}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Soil health */}
              <div className="card" style={{ marginBottom: 16 }}>
                <ScoreBar score={result.soil_health_score} />
              </div>

              {/* AI Analysis */}
              <div className="card" style={{ marginBottom: 16, background: 'var(--green-50)', border: '1px solid var(--green-300)' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <ThumbsUp size={16} color="var(--green-600)" />
                  <h3 style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--green-800)' }}>AI Analysis</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {result.ai_analysis}
                </p>
              </div>

              {/* Crop recommendations */}
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>
                🏆 Top Crop Recommendations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {result.top_recommendations?.map((rec, i) => (
                  <CropCard key={i} rec={rec} rank={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
