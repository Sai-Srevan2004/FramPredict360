import { useAuth } from '../context/AuthContext';
import Layout from '../components/dashboard/Layout';
import { useNavigate } from 'react-router-dom';
import { Sprout, TrendingUp, Bug, ChevronRight, Leaf, Cloud, BarChart2 } from 'lucide-react';

const features = [
  {
    icon: Sprout,
    title: 'Crop Advisor',
    description: 'Get AI-powered crop recommendations based on your soil composition, location coordinates, and live weather conditions.',
    path: '/crop',
    badge: 'AI Powered',
    badgeClass: 'badge-green',
    color: 'var(--green-600)',
    bg: 'var(--green-50)',
    border: 'var(--green-300)',
  },
  {
    icon: TrendingUp,
    title: 'Price Forecast',
    description: 'Predict market prices for any crop across Telangana districts. 7-day historical analysis + tomorrow\'s price + week-ahead forecast.',
    path: '/price',
    badge: 'LLM Analysis',
    badgeClass: 'badge-blue',
    color: 'var(--blue-500)',
    bg: 'var(--blue-100)',
    border: '#bfdbfe',
  },
  {
    icon: Bug,
    title: 'Disease Detect',
    description: 'Upload a photo of your plant leaf. Our ML model identifies diseases instantly and gives you treatment plans and organic remedies.',
    path: '/disease',
    badge: 'ML Model',
    badgeClass: 'badge-amber',
    color: 'var(--amber-500)',
    bg: 'var(--amber-100)',
    border: '#fde68a',
  },
];


export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="animate-fadeInUp">
        {/* Welcome banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--green-900) 0%, var(--green-700) 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 32px',
          marginBottom: 28,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', right: -40, top: -40,
            width: 200, height: 200,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute', right: 40, bottom: -60,
            width: 160, height: 160,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '50%'
          }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p style={{ opacity: 0.8, fontSize: '0.95rem', maxWidth: 500 }}>
            Your agricultural intelligence dashboard is ready. Analyse crops, forecast prices, or detect plant diseases below.
          </p>
          {user?.location?.district && (
            <div style={{
              marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.12)', padding: '5px 12px',
              borderRadius: 99, fontSize: '0.8rem', backdropFilter: 'blur(4px)'
            }}>
              📍 {user.location.district}, Telangana
            </div>
          )}
        </div>

    

        {/* Feature cards */}
        <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 16, color: 'var(--text-secondary)' }}>
          🚀 Tools & Features
        </h3>
        <div className="grid-3" style={{ marginBottom: 28 }}>
          {features.map(({ icon: Icon, title, description, path, badge, badgeClass, color, bg, border }) => (
            <div
              key={path}
              className="card card-hover"
              onClick={() => navigate(path)}
              style={{ cursor: 'pointer', border: `1px solid ${border}`, padding: 24 }}
            >
              <div style={{
                width: 50, height: 50,
                background: bg,
                borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16
              }}>
                <Icon size={24} color={color} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{title}</h3>
                <span className={`badge ${badgeClass}`}>{badge}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 16 }}>
                {description}
              </p>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                color, fontSize: '0.85rem', fontWeight: 600
              }}>
                Get started <ChevronRight size={15} />
              </div>
            </div>
          ))}
        </div>

        {/* Quick tips */}
        <div className="card" style={{ background: 'var(--green-50)', border: '1px solid var(--green-300)' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14, color: 'var(--green-800)' }}>
            💡 Quick Tips for Best Results
          </h3>
          <div className="grid-3">
            {[
              { tip: 'For Crop Prediction', detail: 'Use GPS coordinates of your field and test your soil NPK values for most accurate recommendations.' },
              { tip: 'For Price Forecasting', detail: 'Select the nearest APMC market to your location in Telangana for most relevant price predictions.' },
              { tip: 'For Disease Detection', detail: 'Take close-up photos of affected leaves in good natural lighting. Avoid blurry or dark images.' },
            ].map(({ tip, detail }) => (
              <div key={tip}>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--green-700)', marginBottom: 4 }}>
                  {tip}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
