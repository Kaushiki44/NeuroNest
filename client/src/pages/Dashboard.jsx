import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlineDocumentText, HiOutlineChatAlt2, HiOutlineEmojiHappy, 
  HiOutlineEmojiSad, HiOutlineMinus, HiOutlineLightBulb
} from 'react-icons/hi';
import './Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data.data);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="dashboard-loading">Loading analytics...</div>;
  if (!data) return <div className="dashboard-loading">No analytics data found.</div>;

  const isAdmin = user?.role === 'admin';
  const title = isAdmin ? 'Platform Analytics' : 'Your Content Analytics';

  const { totalBlogs, totalComments, sentimentStats, topBlogs, recentBlogs } = data;

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">TOTAL BLOGS</span>
            <span className="stat-value">{totalBlogs}</span>
          </div>
          <div className="stat-icon-wrapper"><HiOutlineDocumentText /></div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">TOTAL COMMENTS</span>
            <span className="stat-value">{totalComments}</span>
          </div>
          <div className="stat-icon-wrapper"><HiOutlineChatAlt2 /></div>
        </div>

      </div>

      <div className="sentiment-dashboard-section">
        <h3 className="chart-title" style={{ marginBottom: '16px' }}>Audience Sentiment</h3>
        {(sentimentStats.positive === 0 && sentimentStats.neutral === 0 && sentimentStats.negative === 0) ? (
          <div className="fallback-banner" style={{ padding: '24px', marginBottom: '0' }}>
            <p>No sentiment data yet</p>
          </div>
        ) : (
          <div className="sentiment-cards-row">
            <div className="sentiment-box" style={{ borderTop: '4px solid #10b981' }}>
              <div className="sentiment-box-icon text-success"><HiOutlineEmojiHappy /></div>
              <div className="sentiment-box-content">
                <span className="sentiment-count">{sentimentStats.positive}</span>
                <span className="sentiment-label">Positive</span>
                <span className="sentiment-msg">👍 Great audience response</span>
              </div>
            </div>

            <div className="sentiment-box" style={{ borderTop: '4px solid #64748b' }}>
              <div className="sentiment-box-icon text-muted"><HiOutlineMinus /></div>
              <div className="sentiment-box-content">
                <span className="sentiment-count">{sentimentStats.neutral}</span>
                <span className="sentiment-label">Neutral</span>
                <span className="sentiment-msg">😐 Moderate engagement</span>
              </div>
            </div>

            <div className="sentiment-box" style={{ borderTop: '4px solid #ef4444' }}>
              <div className="sentiment-box-icon text-danger"><HiOutlineEmojiSad /></div>
              <div className="sentiment-box-content">
                <span className="sentiment-count">{sentimentStats.negative}</span>
                <span className="sentiment-label">Negative</span>
                <span className="sentiment-msg">⚠ Needs improvement</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {totalBlogs === 0 ? (
        <div className="fallback-banner">
          <h3>Start writing to see analytics ✍️</h3>
          <p>You haven't published any posts yet. Once you do, your stats will appear here.</p>
          <Link to="/posts/create" className="btn btn-primary" style={{marginTop: 16, display: 'inline-block'}}>Create Post</Link>
        </div>
      ) : (
        <div className="charts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
          <div className="chart-card">
            <h3 className="chart-title">Top Performing Posts</h3>
            {topBlogs.length === 0 ? (
              <p className="stat-subtext">No views yet.</p>
            ) : (
              <ul className="dashboard-list">
                {topBlogs.slice(0, 3).map(blog => (
                  <li key={blog._id} className="dashboard-list-item">
                    <div className="blog-info">
                      <strong>{blog.title.length > 35 ? blog.title.substring(0, 35) + '...' : blog.title}</strong>
                      <div className="blog-metrics">
                        <span>{blog.views} views</span>
                        <span>{blog.commentCount} comments</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Recent Blogs</h3>
            <ul className="dashboard-list">
              {recentBlogs.map(blog => (
                <li key={blog._id} className="dashboard-list-item">
                  <div className="blog-info">
                    <strong>{blog.title.length > 35 ? blog.title.substring(0, 35) + '...' : blog.title}</strong>
                    <span className="blog-date">{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  {isAdmin && <span className="blog-author text-muted text-sm">By {blog.author?.name}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {totalBlogs > 0 && totalComments === 0 && (
         <div className="fallback-banner" style={{marginTop: 32}}>
          <h3>No engagement yet 💬</h3>
          <p>Keep sharing your content to get discussions started!</p>
        </div>
      )}

      {totalBlogs > 0 && (
        <div className="insights-section">
          <h2 className="insights-header"><HiOutlineLightBulb /> Actionable Insights</h2>
          <div className="insights-grid">
            <div className="insight-card suggestions-card">
              <ul>
                {(() => {
                  const insights = [];
                  
                  if (totalComments === 0) {
                    insights.push("Low engagement detected — try improving post length or structure.");
                  } else if (totalComments > totalBlogs * 2) {
                    insights.push("Your posts get high engagement with multiple comments per post.");
                  }

                  const { positive, neutral, negative } = sentimentStats;
                  if (positive + neutral + negative > 0) {
                    if (positive > neutral + negative) {
                      insights.push("Most of your comments are positive — good audience response!");
                    } else if (negative > positive) {
                      insights.push("Higher negative sentiment detected — review recent comments.");
                    }
                  }

                  if (topBlogs.length > 0 && topBlogs[0].views > 5) {
                    insights.push(`Your top post "${topBlogs[0].title.substring(0, 20)}..." is driving the most traffic.`);
                  }

                  if (insights.length === 0) insights.push("Publish more content to unlock deeper insights.");

                  return insights.slice(0, 3).map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ));
                })()}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
