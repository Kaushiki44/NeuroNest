import { Link } from 'react-router-dom';
import { HiOutlineEye, HiOutlineHeart, HiOutlineClock, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import './PostCard.css';

const PostCard = ({ post, showActions = false, onDelete }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const excerpt = post.excerpt || stripHtml(post.content).substring(0, 150) + '...';

  return (
    <article className="post-card card" id={`post-card-${post._id}`}>
      <div className="post-card-body">
        <div className="post-card-header">
          <div className="post-card-meta">
            {post.author && (
              <span className="post-card-author">{post.author.name}</span>
            )}
            <span className="post-card-dot">·</span>
            <span className="post-card-date">
              <HiOutlineClock />
              {formatDate(post.createdAt)}
            </span>
          </div>
          <span className={`badge ${post.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
            {post.status}
          </span>
        </div>

        <Link to={`/posts/${post._id}`} className="post-card-title-link">
          <h3 className="post-card-title">{post.title}</h3>
        </Link>

        <p className="post-card-excerpt">{excerpt}</p>

        {post.tags && post.tags.length > 0 && (
          <div className="post-card-tags">
            {post.tags.map((tag, idx) => (
              <span key={idx} className="tag">#{tag}</span>
            ))}
          </div>
        )}

        <div className="post-card-footer">
          <div className="post-card-stats">
            <span className="post-stat">
              <HiOutlineEye />
              {post.views || 0} views
            </span>
            <span className="post-stat">
              <HiOutlineHeart />
              {post.likes?.length || 0} likes
            </span>
            {post.qualityScore !== undefined && (
              <span className={`post-stat quality-badge ${post.qualityScore >= 80 ? 'quality-good' : post.qualityScore >= 50 ? 'quality-ok' : 'quality-bad'}`}>
                {post.qualityScore} Score
              </span>
            )}
          </div>

          {showActions && (
            <div className="post-card-actions">
              <Link to={`/posts/edit/${post._id}`} className="btn btn-ghost btn-sm" id={`edit-post-${post._id}`}>
                <HiOutlinePencil />
                Edit
              </Link>
              <button
                onClick={() => onDelete && onDelete(post._id)}
                className="btn btn-danger btn-sm"
                id={`delete-post-${post._id}`}
              >
                <HiOutlineTrash />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default PostCard;
