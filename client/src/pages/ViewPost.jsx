import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  HiOutlineEye, HiOutlineHeart, HiHeart, HiOutlineClock, 
  HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash 
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './ViewPost.css';

const ViewPost = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Comments State
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get(`/posts/${id}/comments`)
        ]);

        setPost(postRes.data.post);
        setLikesCount(postRes.data.post.likes?.length || 0);
        if (user) {
          setLiked(postRes.data.post.likes?.includes(user.id));
        }

        setComments(commentsRes.data.comments || []);
      } catch (error) {
        toast.error('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchPostAndComments();
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

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const { data } = await api.post(`/posts/${id}/comments`, { text: newComment });
      setComments([data.comment, ...comments]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await api.delete(`/posts/${id}/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
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

  const formatCommentDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

        {isOwner && post.qualityScore !== undefined && (
          <div className="quality-feedback-section">
            <h3>Quality Insights: {post.qualityScore}/100</h3>
            <ul>
              {post.qualityFeedback?.map((fb, idx) => (
                <li key={idx}>{fb}</li>
              ))}
            </ul>
          </div>
        )}

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

      {/* Comments Section */}
      <section className="comments-section animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h3 className="comments-title">Discussion ({comments.length})</h3>

        {isAuthenticated ? (
          <form className="comment-form" onSubmit={handleAddComment}>
            <div className="comment-input-wrapper">
              <div className="view-post-avatar comment-form-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <textarea
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={500}
                required
              />
            </div>
            <div className="comment-form-actions">
              <span className="char-count">{newComment.length}/500</span>
              <button 
                type="submit" 
                className="btn btn-primary btn-sm"
                disabled={submittingComment || !newComment.trim()}
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="comment-login-prompt">
            <p>You must be logged in to join the discussion.</p>
            <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
          </div>
        )}

        <div className="comments-feed">
          {comments.length === 0 ? (
            <p className="no-comments-msg">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            comments.map((comment) => {
              const isCommentOwner = user && comment.user && user.id === comment.user._id;
              const canDelete = isCommentOwner || isOwner;

              return (
                <div key={comment._id} className="comment-card">
                  <div className="comment-header">
                    <div className="comment-author-info">
                      <div className="view-post-avatar comment-avatar">
                        {comment.user?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <span className="comment-author">{comment.user?.name || 'Unknown User'}</span>
                        <span className="comment-date">{formatCommentDate(comment.createdAt)}</span>
                      </div>
                    </div>
                    {canDelete && (
                      <button 
                        className="comment-delete-btn"
                        onClick={() => handleDeleteComment(comment._id)}
                        title="Delete comment"
                      >
                        <HiOutlineTrash />
                      </button>
                    )}
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default ViewPost;
