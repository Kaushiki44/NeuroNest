import { useState, useEffect } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { HiOutlineSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Explore.css';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const { data } = await api.get('/posts');
        setPosts(data.posts);
      } catch (error) {
        toast.error('Failed to load explore feed');
      } finally {
        setLoading(false);
      }
    };
    fetchAllPosts();
  }, []);

  return (
    <div className="explore-page container" id="explore-page">
      <div className="explore-header animate-fade-in">
        <div>
          <h1 className="explore-title">
            <HiOutlineSparkles style={{ marginRight: '10px', color: 'var(--accent-primary)' }} />
            Explore
          </h1>
          <p className="explore-subtitle">Discover the latest published posts from all creators</p>
        </div>
      </div>

      {loading ? (
        <div className="explore-loading">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16, marginBottom: 16 }} />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="explore-posts stagger-children">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="explore-empty animate-fade-in">
          <div className="empty-icon">🌍</div>
          <h3 className="empty-title">No posts found</h3>
          <p className="empty-desc">It looks like no one has published any posts yet.</p>
        </div>
      )}
    </div>
  );
};

export default Explore;
