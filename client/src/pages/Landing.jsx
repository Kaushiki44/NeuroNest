import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineLightningBolt, HiOutlineChartBar, HiOutlineShieldCheck, HiOutlineCode, HiOutlineArrowRight } from 'react-icons/hi';
import './Landing.css';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <HiOutlineLightningBolt />,
      title: 'Lightning Fast',
      desc: 'Create and publish content in seconds with our streamlined editor.',
    },
    {
      icon: <HiOutlineChartBar />,
      title: 'Engagement Tracking',
      desc: 'Monitor views, likes, and reader engagement in real time.',
    },
    {
      icon: <HiOutlineShieldCheck />,
      title: 'Secure by Default',
      desc: 'JWT-based authentication keeps your content safe and private.',
    },
    {
      icon: <HiOutlineCode />,
      title: 'Rich Text Editor',
      desc: 'Write with formatting, code blocks, lists, and more.',
    },
  ];

  return (
    <div className="landing" id="landing-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-orb hero-bg-orb-1" />
        <div className="hero-bg-orb hero-bg-orb-2" />
        <div className="hero-bg-orb hero-bg-orb-3" />

        <div className="container hero-content">
          <div className="hero-badge animate-fade-in">
            <span className="hero-badge-dot" />
            Open Source CMS Platform
          </div>

          <h1 className="hero-title animate-slide-up">
            Where Ideas Find
            <span className="hero-title-accent"> Their Nest</span>
          </h1>

          <p className="hero-subtitle animate-slide-up" style={{ animationDelay: '0.1s' }}>
            NeuroNest is a modern content management system designed for creators.
            Write, publish, and track your content — all in one beautiful interface.
          </p>

          <div className="hero-actions animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg" id="hero-cta-dashboard">
                Go to Dashboard
                <HiOutlineArrowRight />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg" id="hero-cta-register">
                  Start Writing Free
                  <HiOutlineArrowRight />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg" id="hero-cta-login">
                  Sign In
                </Link>
              </>
            )}
          </div>

          <div className="hero-stats animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="hero-stat">
              <span className="hero-stat-value">∞</span>
              <span className="hero-stat-label">Posts</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">100%</span>
              <span className="hero-stat-label">Local</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">0</span>
              <span className="hero-stat-label">External APIs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header animate-fade-in">
            <h2 className="section-title">Built for Modern Creators</h2>
            <p className="section-subtitle">
              Everything you need to manage your content, without the complexity.
            </p>
          </div>

          <div className="features-grid stagger-children">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card animate-fade-in">
            <div className="cta-glow" />
            <h2 className="cta-title">Ready to start writing?</h2>
            <p className="cta-desc">Create your free account and publish your first post in minutes.</p>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-primary btn-lg" id="cta-register">
                Get Started Now
                <HiOutlineArrowRight />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <p className="footer-text">
            <span className="navbar-logo" style={{ fontSize: '1rem', marginRight: 8 }}>⬡</span>
            NeuroNest — Built with the MERN Stack
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
