import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { HiOutlinePlusCircle, HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './ManageBlogs.css';

const ManageBlogs = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleToggleStatus = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await api.patch(`/posts/${post._id}/status`, { status: newStatus });
      setPosts(posts.map((p) => p._id === post._id ? { ...p, status: newStatus } : p));
      toast.success(`Post marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to change status');
    }
  };

  const getQualityLabel = (score) => {
    if (score >= 80) return <span className="quality-good">Good</span>;
    if (score >= 50) return <span className="quality-ok">Average</span>;
    return <span className="quality-bad">Needs Improvement</span>;
  };

  return (
    <div className="manage-blogs-page container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Manage Blogs</h1>
        <Link to="/posts/new" className="btn btn-primary">
          <HiOutlinePlusCircle /> New Blog
        </Link>
      </div>

      <div className="table-container card">
        {loading ? (
          <div className="loading-state">Loading your blogs...</div>
        ) : posts.length === 0 ? (
          <div className="empty-state">No blogs found. Create one!</div>
        ) : (
          <table className="blogs-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Quality</th>
                <th>Views</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post._id}>
                  <td className="col-title">
                    <Link to={`/posts/${post._id}`}>{post.title}</Link>
                  </td>
                  <td className="col-category">
                    {post.tags && post.tags.length > 0 ? post.tags[0] : 'None'}
                  </td>
                  <td className="col-status">
                    <span className={`badge badge-${post.status}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="col-quality">
                    {getQualityLabel(post.qualityScore || 0)}
                  </td>
                  <td className="col-views">{post.views || 0}</td>
                  <td className="col-actions">
                    <button 
                      onClick={() => handleToggleStatus(post)} 
                      className="action-btn status-btn"
                      title={post.status === 'published' ? 'Unpublish to Draft' : 'Publish Post'}
                    >
                      {post.status === 'published' ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                    </button>
                    <Link to={`/posts/edit/${post._id}`} className="action-btn edit-btn">
                      <HiOutlinePencil />
                    </Link>
                    <button onClick={() => handleDelete(post._id)} className="action-btn delete-btn">
                      <HiOutlineTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageBlogs;
