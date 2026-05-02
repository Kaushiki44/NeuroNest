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

  const excerpt = post.excerpt || stripHtml(post.content);

  const getScoreColor = (score) => {
    if (score >= 80) return 'score-good';
    if (score >= 50) return 'score-ok';
    return 'score-bad';
  };

  return (
    <article className="post-card animate-fade-in" id={`post-card-${post._id}`}>
      {post.thumbnail ? (
        <div className="post-card-thumbnail">
          <img src={post.thumbnail} alt={post.title} />
          <div className="thumbnail-overlay"></div>
        </div>
      ) : (
        <div className="post-card-thumbnail-placeholder" />
      )}

      <div className="post-card-content">
        <Link to={`/posts/${post._id}`} className="post-card-title-link">
          <h3 className="post-card-title">{post.title}</h3>
        </Link>

        <p className="post-card-excerpt">{excerpt}</p>

        <div className="post-card-stats-row">
          <div className="stats-group">
            <span className="stat-item" title="Views">
              <HiOutlineEye /> {post.views || 0}
            </span>
            <span className="stat-item" title="Likes">
              <HiOutlineHeart /> {post.likes?.length || 0}
            </span>
            {post.qualityScore !== undefined && (
              <span className={`stat-score ${getScoreColor(post.qualityScore)}`} title="Quality Score">
                <span className="score-dot"></span>
                {post.qualityScore}
              </span>
            )}
          </div>
        </div>

        <div className="post-card-footer">
          <div className="post-card-meta">
            {post.author && <span>{post.author.name}</span>}
            <span className="meta-dot">·</span>
            <span className="meta-date">
              <HiOutlineClock /> {formatDate(post.createdAt)}
            </span>
          </div>

          {showActions && (
            <div className="post-card-actions">
              <Link to={`/posts/edit/${post._id}`} className="action-icon" title="Edit Post">
                <HiOutlinePencil />
              </Link>
              <button onClick={() => onDelete && onDelete(post._id)} className="action-icon action-delete" title="Delete Post">
                <HiOutlineTrash />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default PostCard;
