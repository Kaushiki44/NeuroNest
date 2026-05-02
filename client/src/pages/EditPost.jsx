import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PostForm from '../components/PostForm';
import toast from 'react-hot-toast';
import './PostPage.css';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        setPost(data.post);
      } catch (error) {
        toast.error('Post not found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, navigate]);

  const handleSubmit = async (postData) => {
    setSaving(true);
    try {
      await api.put(`/posts/${id}`, postData);
      toast.success('Post updated!');
      navigate(`/posts/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="post-page container-narrow">
        <div className="skeleton" style={{ height: 40, width: 300, marginBottom: 16, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 60, marginBottom: 16, borderRadius: 12 }} />
        <div className="skeleton" style={{ height: 400, borderRadius: 12 }} />
      </div>
    );
  }

  return (
    <div className="post-page container-narrow" id="edit-post-page">
      <div className="post-page-header animate-fade-in">
        <h1 className="post-page-title">Edit Post</h1>
        <p className="post-page-subtitle">Update your content</p>
      </div>
      {post && (
        <PostForm
          initialData={post}
          onSubmit={handleSubmit}
          loading={saving}
          submitLabel="Save Changes"
        />
      )}
    </div>
  );
};

export default EditPost;
