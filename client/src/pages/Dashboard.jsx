import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTheme } from '../context/ThemeContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  HiOutlineDocumentText, HiOutlineEye, HiOutlineTrendingUp, HiOutlineSparkles,
  HiOutlineLightBulb, HiArrowUp, HiArrowDown
} from 'react-icons/hi';
import './Dashboard.css';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get('/analytics');
        setAnalytics(data.data);
      } catch (error) {
        console.error('Failed to load analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="dashboard-loading">Loading analytics...</div>;
  if (!analytics) return <div className="dashboard-loading">No analytics data found.</div>;

  const {
    totalPosts, publishedPosts, draftPosts,
    totalViews, avgQualityScore, totalEngagementScore,
    engagementLabel, topPerformingPosts, allPosts, insights
  } = analytics;

  // Format Top Posts Data for BarChart
  const topPostsData = topPerformingPosts.map(p => ({
    name: p.title.substring(0, 15) + '...',
    engagement: p.engagementScore
  }));

  // Format Quality Sentiment Data
  const positive = allPosts.filter(p => p.qualityScore >= 80).length;
  const neutral = allPosts.filter(p => p.qualityScore >= 50 && p.qualityScore < 80).length;
  const negative = allPosts.filter(p => p.qualityScore < 50).length;

  const sentimentData = [
    { name: 'High Quality (80+)', value: positive, color: '#10b981' },
    { name: 'Average (50-79)', value: neutral, color: '#6366f1' },
    { name: 'Needs Work (<50)', value: negative, color: '#ef4444' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          background: isDark ? 'var(--bg-card)' : '#fff', 
          border: '1px solid var(--border-color)',
          padding: '10px',
          borderRadius: '8px',
          color: 'var(--text-primary)'
        }}>
          <p className="label" style={{ margin: 0, fontWeight: 600 }}>{`${label || payload[0].name} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const renderTrend = () => {
    if (!insights?.trend) return null;
    const { value, isPositive } = insights.trend;
    return (
      <span className={`trend-badge ${isPositive ? 'trend-up' : 'trend-down'}`}>
        {isPositive ? <HiArrowUp /> : <HiArrowDown />}
        {Math.abs(value)}%
      </span>
    );
  };

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Analytics Overview</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">TOTAL BLOGS</span>
            <span className="stat-value">{totalPosts}</span>
            <span className="stat-subtext">{publishedPosts} published, {draftPosts} drafts</span>
          </div>
          <div className="stat-icon-wrapper"><HiOutlineDocumentText /></div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">TOTAL VIEWS</span>
            <span className="stat-value">{totalViews}</span>
          </div>
          <div className="stat-icon-wrapper"><HiOutlineEye /></div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">AVG QUALITY SCORE</span>
            <span className="stat-value">{avgQualityScore}</span>
            <span className="stat-subtext">out of 100</span>
          </div>
          <div className="stat-icon-wrapper"><HiOutlineSparkles /></div>
        </div>

        <div className="stat-card stat-card-engagement">
          <div className="stat-content">
            <span className="stat-label">ENGAGEMENT SCORE</span>
            <div className="stat-value-group">
              <span className="stat-value">{totalEngagementScore}</span>
              {renderTrend()}
            </div>
            <span className="stat-subtext">Avg per post: <strong>{engagementLabel}</strong></span>
          </div>
          <div className="stat-icon-wrapper"><HiOutlineTrendingUp /></div>
        </div>
      </div>

      {publishedPosts < 5 ? (
        <div className="fallback-banner">
          <h3>Keep writing! ✍️</h3>
          <p>Advanced charts and comparative metrics unlock after 5 published posts to ensure reliable insights.</p>
        </div>
      ) : (
        <div className="charts-grid">
          <div className="chart-card">
            <h3 className="chart-title">Top Performing Content</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topPostsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
                  <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} tick={{ fontSize: 12 }} />
                  <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} tick={{ fontSize: 12 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="engagement" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Content Quality Distribution</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sentimentData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {sentimentData.filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Actionable Insights Section always visible (though some sub-sections depend on data) */}
      <div className="insights-section">
        <h2 className="insights-header"><HiOutlineLightBulb /> Actionable Insights</h2>
        
        <div className="insights-grid">
          {insights?.correlation && insights.correlation.strength !== 'None' && (
            <div className="insight-card">
              <h4>Correlation Engine</h4>
              <p>Your content quality has a <strong>{insights.correlation.strength.toLowerCase()} correlation</strong> (r={insights.correlation.value}) with overall engagement.</p>
            </div>
          )}

          {insights?.comparative && (
            <div className="insight-card">
              <h4>Comparative Analytics</h4>
              <p>Your <strong>Top 25%</strong> of posts generate <strong>{insights.comparative.multiplier}x</strong> more engagement than your bottom 25%. They average a quality score of <strong>{insights.comparative.topQuality}</strong> (vs {insights.comparative.bottomQuality}).</p>
            </div>
          )}

          <div className="insight-card suggestions-card">
            <h4>Suggestions</h4>
            <ul>
              {insights?.suggestions.map((suggestion, idx) => (
                <li key={idx}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
