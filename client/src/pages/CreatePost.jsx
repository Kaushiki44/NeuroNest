import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PostForm from '../components/PostForm';
import toast from 'react-hot-toast';
import './PostPage.css';

const CreatePost = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (postData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/posts', postData);
      toast.success(postData.status === 'published' ? 'Post published!' : 'Draft saved!');
      navigate(`/posts/${data.post._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-page container-narrow" id="create-post-page">
      <div className="post-page-header animate-fade-in">
        <h1 className="post-page-title">Create New Post</h1>
        <p className="post-page-subtitle">Share your thoughts with the world</p>
      </div>
      <PostForm onSubmit={handleSubmit} loading={loading} submitLabel="Publish Post" />
    </div>
  );
};

export default CreatePost;
