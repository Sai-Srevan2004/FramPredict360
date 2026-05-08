import { useState, useRef } from 'react';
import Layout from '../components/dashboard/Layout';
import api from '../utils/api';
import { Bug, Upload, X, Loader2, AlertTriangle, CheckCircle, Leaf } from 'lucide-react';

const SEVERITY_STYLES = {
  Mild:     { color: 'var(--green-600)',  bg: 'var(--green-50)',  border: 'var(--green-300)' },
  Moderate: { color: 'var(--amber-500)',  bg: 'var(--amber-100)', border: '#fde68a' },
  Severe:   { color: 'var(--red-500)',    bg: 'var(--red-100)',   border: 'var(--red-400)' },
  None:     { color: 'var(--green-600)',  bg: 'var(--green-50)',  border: 'var(--green-300)' },
};

const CROP_TYPES = ['Rice'];


export default function DiseasePage() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
const [cropType, setCropType] = useState('Rice');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();
  const dropRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }
    setError('');
    setImage(file);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropRef.current?.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleSubmit = async () => {
    if (!image) return setError('Please select an image first.');
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('crop_type', cropType);
      const res = await api.post('/disease/detect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Detection failed. Ensure FastAPI service is running.');
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const severityStyle = result ? (SEVERITY_STYLES[result.severity] || SEVERITY_STYLES.Mild) : null;
  const isHealthy = result?.disease_name === 'Healthy';

  return (
    <Layout>
      <div className="animate-fadeInUp">
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 4 }}>🔬 Plant Disease Detector</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Upload a leaf image to detect diseases and get AI-powered treatment recommendations
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: result ? '420px 1fr' : '600px', gap: 24, justifyContent: result ? undefined : 'center' }}>
          {/* Upload panel */}
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Crop Type (optional)</label>
                <select className="form-input form-select" value={cropType} onChange={e => setCropType(e.target.value)}>
                  {CROP_TYPES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Drop zone */}
              {!preview ? (
                <div
                  ref={dropRef}
                  onDragOver={(e) => { e.preventDefault(); dropRef.current?.classList.add('drag-over'); }}
                  onDragLeave={() => dropRef.current?.classList.remove('drag-over')}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border-strong)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '48px 24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'var(--surface-2)',
                    transition: 'all 0.2s'
                  }}
                  className="dropzone"
                >
                  <div style={{
                    width: 60, height: 60,
                    background: 'var(--green-100)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <Upload size={28} color="var(--green-600)" />
                  </div>
                  <p style={{ fontWeight: 600, marginBottom: 6 }}>Drop leaf image here</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    or click to browse · JPG, PNG, WEBP · max 10MB
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => handleFile(e.target.files[0])}
                  />
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <img
                    src={preview}
                    alt="Leaf preview"
                    style={{
                      width: '100%', maxHeight: 320,
                      objectFit: 'cover', borderRadius: 'var(--radius-lg)',
                      border: '2px solid var(--border)'
                    }}
                  />
                  <button
                    onClick={clearImage}
                    style={{
                      position: 'absolute', top: 10, right: 10,
                      width: 30, height: 30, background: 'rgba(0,0,0,0.6)',
                      borderRadius: '50%', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff'
                    }}
                  >
                    <X size={14} />
                  </button>
                  <div style={{
                    marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}>
                    <Leaf size={13} />
                    {image?.name} · {(image?.size / 1024).toFixed(0)} KB
                  </div>
                </div>
              )}
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

            <button
              onClick={handleSubmit}
              className="btn btn-primary btn-lg"
              disabled={loading || !image}
              style={{ width: '100%' }}
            >
              {loading
                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />Analysing leaf…</>
                : <><Bug size={18} />Detect Disease</>
              }
            </button>

            {/* Tips */}
            <div className="card" style={{ marginTop: 16, background: 'var(--green-50)', border: '1px solid var(--green-300)' }}>
  <h4 style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--green-800)', marginBottom: 10 }}>
    🌾 Detectable Rice Diseases
  </h4>
  {[
    'Bacterial Leaf Blight',
    'Brown Spot',
    'Healthy Rice Leaf',
    'Leaf Blast',
    'Leaf Scald',
    'Sheath Blight'
  ].map(d => (
    <div key={d} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
      • {d}
    </div>
  ))}
</div>
          </div>

          {/* Results panel */}
          {result && (
            <div className="animate-fadeIn">
              {/* Disease banner */}
              <div style={{
                padding: '20px 24px', borderRadius: 'var(--radius-lg)',
                background: isHealthy ? 'linear-gradient(135deg, var(--green-700), var(--green-500))' : 'linear-gradient(135deg, #7f1d1d, var(--red-500))',
                color: '#fff', marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 16
              }}>
                <div style={{
                  width: 56, height: 56,
                  background: 'rgba(255,255,255,0.15)', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.6rem', flexShrink: 0
                }}>
                  {isHealthy ? '✅' : '🦠'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{result.disease_name}</div>
                  <div style={{ opacity: 0.85, fontSize: '0.85rem' }}>
                    Confidence: {Math.round(result.confidence * 100)}% · Severity: {result.severity}
                  </div>
                </div>
                {!isHealthy && (
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>~{result.affected_area}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>affected area</div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="card" style={{ marginBottom: 16, ...(!isHealthy ? { background: severityStyle?.bg, border: `1px solid ${severityStyle?.border}` } : {}) }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  {isHealthy ? <CheckCircle size={16} color="var(--green-600)" /> : <AlertTriangle size={16} color={severityStyle?.color} />}
                  <h4 style={{ fontWeight: 700, fontSize: '0.88rem', color: severityStyle?.color }}>About This Condition</h4>
                </div>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{result.description}</p>
              </div>

              {/* AI Analysis */}
              <div className="card" style={{ marginBottom: 16, background: 'var(--surface-2)' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 8 }}>🤖 AI Analysis</h4>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{result.ai_analysis}</p>
              </div>

              {!isHealthy && (
                <>
                  <div className="grid-3" style={{ marginBottom: 0 }}>
                    {/* Treatment */}
                    <div className="card" style={{ background: 'var(--red-100)', border: '1px solid var(--red-400)' }}>
                      <h4 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#991b1b', marginBottom: 10 }}>
                        💊 Treatment
                      </h4>
                      {result.treatment?.map((t, i) => (
                        <div key={i} style={{
                          padding: '7px 10px', background: 'rgba(255,255,255,0.6)',
                          borderRadius: 8, marginBottom: 6, fontSize: '0.8rem', lineHeight: 1.5,
                          color: 'var(--text-primary)'
                        }}>
                          {i + 1}. {t}
                        </div>
                      ))}
                    </div>

                    {/* Prevention */}
                    <div className="card" style={{ background: 'var(--blue-100)', border: '1px solid #bfdbfe' }}>
                      <h4 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e40af', marginBottom: 10 }}>
                        🛡️ Prevention
                      </h4>
                      {result.prevention?.map((p, i) => (
                        <div key={i} style={{
                          padding: '7px 10px', background: 'rgba(255,255,255,0.6)',
                          borderRadius: 8, marginBottom: 6, fontSize: '0.8rem', lineHeight: 1.5,
                          color: 'var(--text-primary)'
                        }}>
                          {i + 1}. {p}
                        </div>
                      ))}
                    </div>

                    {/* Organic remedies */}
                    <div className="card" style={{ background: 'var(--green-50)', border: '1px solid var(--green-300)' }}>
                      <h4 style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--green-800)', marginBottom: 10 }}>
                        🌿 Organic Remedies
                      </h4>
                      {result.organic_remedies?.map((r, i) => (
                        <div key={i} style={{
                          padding: '7px 10px', background: 'rgba(255,255,255,0.6)',
                          borderRadius: 8, marginBottom: 6, fontSize: '0.8rem', lineHeight: 1.5,
                          color: 'var(--text-primary)'
                        }}>
                          {i + 1}. {r}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dropzone:hover, .drag-over {
          border-color: var(--green-500) !important;
          background: var(--green-50) !important;
        }
      `}</style>
    </Layout>
  );
}
