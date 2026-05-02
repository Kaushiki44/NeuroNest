import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { HiOutlinePlusCircle, HiOutlineEye, HiOutlineHeart, HiOutlineDocumentText, HiOutlineSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      const { data } = await api.get('/posts/my');
      setPosts(data.posts);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter((p) => p._id !== postId));
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const avgQuality = posts.length > 0 
    ? Math.round(posts.reduce((sum, p) => sum + (p.qualityScore || 0), 0) / posts.length) 
    : 0;

  const filteredPosts = filter === 'all' ? posts : posts.filter((p) => p.status === filter);

  return (
    <div className="dashboard-page container" id="dashboard-page">
      <div className="dashboard-header animate-fade-in">
        <div>
          <h1 className="dashboard-title">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="dashboard-subtitle">Manage your content and track engagement</p>
        </div>
        <Link to="/posts/new" className="btn btn-primary" id="dashboard-new-post">
          <HiOutlinePlusCircle />
          New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="dashboard-stats stagger-children">
        <div className="stat-card card">
          <div className="stat-icon stat-icon-posts"><HiOutlineDocumentText /></div>
          <div className="stat-info">
            <span className="stat-value">{posts.length}</span>
            <span className="stat-label">Total Posts</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon stat-icon-published"><HiOutlineDocumentText /></div>
          <div className="stat-info">
            <span className="stat-value">{publishedCount}</span>
            <span className="stat-label">Published</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon stat-icon-views"><HiOutlineEye /></div>
          <div className="stat-info">
            <span className="stat-value">{totalViews}</span>
            <span className="stat-label">Total Views</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon stat-icon-likes"><HiOutlineHeart /></div>
          <div className="stat-info">
            <span className="stat-value">{totalLikes}</span>
            <span className="stat-label">Total Likes</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon stat-icon-quality"><HiOutlineSparkles /></div>
          <div className="stat-info">
            <span className="stat-value">{avgQuality}</span>
            <span className="stat-label">Avg Quality</span>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="dashboard-filter animate-fade-in">
        <h2 className="dashboard-section-title">Your Posts</h2>
        <div className="filter-tabs">
          {['all', 'published', 'draft'].map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'filter-tab-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="dashboard-loading">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16, marginBottom: 16 }} />
          ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="dashboard-posts stagger-children">
          {filteredPosts.map((post) => (
            <PostCard key={post._id} post={post} showActions onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="dashboard-empty animate-fade-in">
          <div className="empty-icon">📝</div>
          <h3 className="empty-title">
            {filter === 'all' ? 'No posts yet' : `No ${filter} posts`}
          </h3>
          <p className="empty-desc">
            {filter === 'all'
              ? 'Create your first post to get started.'
              : `You don't have any ${filter} posts.`}
          </p>
          {filter === 'all' && (
            <Link to="/posts/new" className="btn btn-primary">
              <HiOutlinePlusCircle /> Create Post
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
