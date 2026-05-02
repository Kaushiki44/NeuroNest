import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { HiOutlineEye, HiOutlineHeart, HiHeart, HiOutlineClock, HiOutlineArrowLeft, HiOutlinePencil } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './ViewPost.css';

const ViewPost = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        setPost(data.post);
        setLikesCount(data.post.likes?.length || 0);
        if (user) {
          setLiked(data.post.likes?.includes(user.id));
        }
      } catch (error) {
        toast.error('Post not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, user]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to like posts');
      return;
    }
    try {
      const { data } = await api.post(`/posts/${id}/like`);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="view-post container-narrow" style={{ paddingTop: 40 }}>
        <div className="skeleton" style={{ height: 40, width: '60%', marginBottom: 16, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 20, width: '30%', marginBottom: 40, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 400, borderRadius: 12 }} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="view-post container-narrow" style={{ paddingTop: 80, textAlign: 'center' }}>
        <h2>Post not found</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>Go Home</Link>
      </div>
    );
  }

  const isOwner = user && post.author && user.id === post.author._id;

  return (
    <div className="view-post container-narrow" id="view-post-page">
      <Link to={isAuthenticated ? '/dashboard' : '/'} className="back-link animate-fade-in">
        <HiOutlineArrowLeft /> Back
      </Link>

      <article className="view-post-article animate-slide-up">
        <header className="view-post-header">
          <div className="view-post-meta">
            <div className="view-post-author-row">
              <div className="view-post-avatar">
                {post.author?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="view-post-author">{post.author?.name}</span>
                <span className="view-post-date">
                  <HiOutlineClock /> {formatDate(post.createdAt)}
                </span>
              </div>
            </div>
            {isOwner && (
              <Link to={`/posts/edit/${post._id}`} className="btn btn-secondary btn-sm">
                <HiOutlinePencil /> Edit
              </Link>
            )}
          </div>

          <h1 className="view-post-title">{post.title}</h1>

          {post.tags && post.tags.length > 0 && (
            <div className="view-post-tags">
              {post.tags.map((tag, idx) => (
                <span key={idx} className="tag">#{tag}</span>
              ))}
            </div>
          )}
        </header>

        <div
          className="view-post-content ql-editor"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <footer className="view-post-footer">
          <div className="view-post-stats">
            <span className="view-post-stat">
              <HiOutlineEye /> {post.views} views
            </span>
            <button
              className={`like-btn ${liked ? 'like-btn-active' : ''}`}
              onClick={handleLike}
              id="like-button"
            >
              {liked ? <HiHeart /> : <HiOutlineHeart />}
              {likesCount} {likesCount === 1 ? 'like' : 'likes'}
            </button>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default ViewPost;
