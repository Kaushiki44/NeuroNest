import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { HiOutlineSparkles, HiOutlineSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Explore.css';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [sort, setSort] = useState('Newest');

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

  const uniqueTags = useMemo(() => {
    const tags = new Set();
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [posts]);

  const filteredAndSortedPosts = useMemo(() => {
    let result = posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = category === 'All Categories' || (post.tags && post.tags.includes(category));
      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      if (sort === 'Newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'Oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'Most Viewed') return (b.views || 0) - (a.views || 0);
      if (sort === 'Highest Score') return (b.qualityScore || 0) - (a.qualityScore || 0);
      return 0;
    });

    return result;
  }, [posts, search, category, sort]);

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

      <div className="explore-controls animate-fade-in">
        <div className="search-bar">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={category} onChange={e => setCategory(e.target.value)} className="explore-select">
            <option value="All Categories">All Categories</option>
            {uniqueTags.map(tag => (
              <option key={tag} value={tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</option>
            ))}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} className="explore-select">
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
            <option value="Most Viewed">Most Viewed</option>
            <option value="Highest Score">Highest Score</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="explore-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton" style={{ height: 380, borderRadius: 16 }} />
          ))}
        </div>
      ) : filteredAndSortedPosts.length > 0 ? (
        <div className="explore-grid stagger-children">
          {filteredAndSortedPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="explore-empty animate-fade-in">
          <div className="empty-icon">🌍</div>
          <h3 className="empty-title">No posts found</h3>
          <p className="empty-desc">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Explore;
