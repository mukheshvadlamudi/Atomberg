import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_CREDENTIALS } from '../data/seed';
import { Zap, Target, CheckSquare, BarChart2, TrendingUp, AlertCircle, ArrowRight, Loader2, User, Briefcase, Shield, X } from 'lucide-react';

const featureIcons: Record<string, React.ReactNode> = {
  'Structured Goal Creation':   <Target size={18} color="#a78bfa" />,
  'Manager Approval Workflow':  <CheckSquare size={18} color="#a78bfa" />,
  'Quarterly Check-ins':        <BarChart2 size={18} color="#a78bfa" />,
  'Analytics & Reports':        <TrendingUp size={18} color="#a78bfa" />,
};

const roleIcons: Record<string, React.ReactNode> = {
  employee: <User size={16} />,
  manager:  <Briefcase size={16} />,
  admin:    <Shield size={16} />,
};

// Microsoft SSO icon (official brand)
const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="10" height="10" fill="#f25022"/>
    <rect x="11" y="0" width="10" height="10" fill="#7fba00"/>
    <rect x="0" y="11" width="10" height="10" fill="#00a4ef"/>
    <rect x="11" y="11" width="10" height="10" fill="#ffb900"/>
  </svg>
);

export default function LoginPage() {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [msLoading, setMsLoading] = useState(false);
  const [showMsModal, setShowMsModal] = useState(false);
  const [msEmail, setMsEmail] = useState('');
  const [msStep, setMsStep] = useState<'email' | 'password' | 'mfa' | 'error'>('email');
  const [msPassword, setMsPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 600));
    const ok = login(email, password);
    if (!ok) setError('Invalid email or password. Please try again.');
    setLoading(false);
  };

  const fillCred = (e: string) => { setEmail(e); setPassword('password123'); setError(''); };

  // Simulate Microsoft SSO flow
  const handleMsLogin = async () => {
    setShowMsModal(true);
    setMsStep('email');
    setMsEmail('');
    setMsPassword('');
  };

  const handleMsEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (msEmail) setMsStep('password');
  };

  const handleMsPasswordNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsStep('mfa');
    await new Promise(r => setTimeout(r, 1200));
    
    // Check if it's a valid demo account
    const matched = DEMO_CREDENTIALS.find(c => c.email.toLowerCase() === msEmail.toLowerCase());
    
    if (matched) {
      setShowMsModal(false);
      setMsLoading(true);
      await new Promise(r => setTimeout(r, 800));
      login(matched.email, 'password123');
      setMsLoading(false);
    } else {
      // If it's a random email, show an SSO error
      setMsStep('error');
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-left">
        <div className="login-brand">
          <Zap size={14} style={{ display: 'inline', marginRight: 6 }} />
          AtomQuest Hackathon 1.0
        </div>
        <h1 className="login-title">Goal Setting &<br />Tracking Portal</h1>
        <p className="login-sub">A unified platform for employee goal management, quarterly check-ins, and performance visibility.</p>
        <div className="login-features">
          {[
            { title: 'Structured Goal Creation',  desc: 'Define goals with thrust areas, UoM types, targets, and weightages.' },
            { title: 'Manager Approval Workflow', desc: 'L1 managers review, edit inline, approve or return goal sheets.' },
            { title: 'Quarterly Check-ins',       desc: 'Track planned vs actual with automated progress scoring.' },
            { title: 'Analytics & Reports',       desc: 'QoQ trends, heatmaps, and exportable achievement reports.' },
          ].map(f => (
            <div className="login-feature" key={f.title}>
              <div className="feat-icon" style={{ background: 'rgba(139,92,246,0.15)' }}>{featureIcons[f.title]}</div>
              <div className="feat-text"><strong>{f.title}</strong>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 0 24px rgba(139,92,246,0.35)' }}>
              <Zap size={24} color="white" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Welcome Back</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Sign in to your portal</div>
          </div>

          {/* Microsoft SSO Button */}
          <button
            onClick={handleMsLogin}
            disabled={msLoading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 10, padding: '10px 16px', marginBottom: 20,
              background: '#ffffff', border: '1px solid #d1d5db',
              borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, color: '#1f2937',
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
            onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
          >
            {msLoading ? <Loader2 size={16} className="animate-spin" style={{ color: '#6b7280' }} /> : <MicrosoftIcon />}
            {msLoading ? 'Authenticating...' : 'Sign in with Microsoft'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>or sign in manually</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••" required />
            </div>
            {error && (
              <div className="alert alert-danger" style={{ marginBottom: 12 }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}
            <button className="btn btn-primary btn-lg" type="submit" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in...</> : <>Sign In <ArrowRight size={15} /></>}
            </button>
          </form>

          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Demo Accounts
            </div>
            <div className="demo-creds">
              {DEMO_CREDENTIALS.map(c => (
                <button key={c.role} className="cred-btn" onClick={() => fillCred(c.email)}>
                  <span style={{ display: 'flex', alignItems: 'center', color: 'var(--accent-light)' }}>{roleIcons[c.role]}</span>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div className="cred-role">{c.label}</div>
                    <div className="cred-email">{c.email}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Microsoft SSO Modal */}
      {showMsModal && (
        <div className="modal-overlay" style={{ zIndex: 999 }}>
          <div style={{
            background: '#ffffff', borderRadius: 4, width: 440, padding: 0,
            boxShadow: '0 16px 64px rgba(0,0,0,0.4)', overflow: 'hidden',
            fontFamily: '"Segoe UI", sans-serif', color: '#000'
          }}>
            {/* MS Header */}
            <div style={{ padding: '24px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <MicrosoftIcon />
              <button onClick={() => setShowMsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <X size={18} />
              </button>
            </div>

            {msStep === 'email' && (
              <form onSubmit={handleMsEmailNext} style={{ padding: '16px 32px 32px' }}>
                <h2 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 8px', color: '#1b1b1b' }}>Sign in</h2>
                <p style={{ fontSize: 13, color: '#444', margin: '0 0 20px' }}>to continue to AtomQuest Portal</p>
                <input
                  type="email" value={msEmail} onChange={e => setMsEmail(e.target.value)}
                  placeholder="Email, phone, or Skype" required autoFocus
                  style={{ width: '100%', padding: '10px 0', borderBottom: '2px solid #0067b8', outline: 'none', fontSize: 14, background: 'transparent', boxSizing: 'border-box', marginBottom: 16 }}
                />
                <p style={{ fontSize: 12, color: '#666', margin: '0 0 24px' }}>No account? <span style={{ color: '#0067b8', cursor: 'pointer' }}>Create one!</span></p>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" style={{ background: '#0067b8', color: '#fff', border: 'none', padding: '10px 24px', fontSize: 14, cursor: 'pointer', borderRadius: 0 }}>Next</button>
                </div>
              </form>
            )}

            {msStep === 'password' && (
              <form onSubmit={handleMsPasswordNext} style={{ padding: '16px 32px 32px' }}>
                <h2 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 4px', color: '#1b1b1b' }}>Enter password</h2>
                <p style={{ fontSize: 13, color: '#0067b8', margin: '0 0 20px', cursor: 'pointer' }} onClick={() => setMsStep('email')}>{msEmail}</p>
                <input
                  type="password" value={msPassword} onChange={e => setMsPassword(e.target.value)}
                  placeholder="Password" required autoFocus
                  style={{ width: '100%', padding: '10px 0', border: 'none', borderBottom: '2px solid #0067b8', outline: 'none', fontSize: 14, background: 'transparent', boxSizing: 'border-box', marginBottom: 24 }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" style={{ background: '#0067b8', color: '#fff', border: 'none', padding: '10px 24px', fontSize: 14, cursor: 'pointer', borderRadius: 0 }}>Sign in</button>
                </div>
              </form>
            )}

            {msStep === 'mfa' && (
              <div style={{ padding: '16px 32px 32px', textAlign: 'center' }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 12px', color: '#1b1b1b' }}>Verifying identity...</h2>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>Connecting to Microsoft Entra ID</p>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                  <Loader2 size={24} className="animate-spin" style={{ color: '#0067b8' }} />
                </div>
              </div>
            )}

            {msStep === 'error' && (
              <div style={{ padding: '16px 32px 32px' }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 12px', color: '#1b1b1b' }}>Sign-in blocked</h2>
                <div style={{ background: '#fdf2f2', border: '1px solid #f87171', padding: 12, borderRadius: 4, marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: '#b91c1c', margin: 0, lineHeight: 1.5 }}>
                    Your account (<strong>{msEmail}</strong>) does not exist in the Atomberg corporate directory.
                  </p>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: 12, borderRadius: 4, marginBottom: 24 }}>
                  <p style={{ fontSize: 13, color: '#1e3a8a', margin: 0, lineHeight: 1.5 }}>
                    <strong>Demo Note:</strong> Full Microsoft Entra ID (Azure AD) MSAL authentication is built into the codebase, but live redirection is disabled in this environment due to strict school/organization tenant restrictions on the developer portal. Please use the hardcoded demo credentials (e.g., arjun.mehta@atomberg.com) to simulate a successful SSO passthrough.
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setMsStep('email')} style={{ background: '#0067b8', color: '#fff', border: 'none', padding: '10px 24px', fontSize: 14, cursor: 'pointer', borderRadius: 0 }}>Back to sign in</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
