import { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './PostForm.css';

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'blockquote', 'code-block',
  'link',
];

const PostForm = ({ initialData = {}, onSubmit, loading = false, submitLabel = 'Publish' }) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [tags, setTags] = useState(initialData.tags?.join(', ') || '');
  const [status, setStatus] = useState(initialData.status || 'draft');

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagArray = tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    onSubmit({
      title,
      content,
      tags: tagArray,
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="post-form animate-fade-in" id="post-form">
      <div className="form-group">
        <label className="form-label" htmlFor="post-title">Title</label>
        <input
          id="post-title"
          type="text"
          className="form-input post-title-input"
          placeholder="Enter a compelling title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Content</label>
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          formats={formats}
          placeholder="Write your story..."
        />
      </div>

      <div className="post-form-row">
        <div className="form-group post-form-flex">
          <label className="form-label" htmlFor="post-tags">Tags</label>
          <input
            id="post-tags"
            type="text"
            className="form-input"
            placeholder="react, javascript, webdev"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <span className="form-hint">Separate with commas</span>
        </div>

        <div className="form-group" style={{ minWidth: 180 }}>
          <label className="form-label" htmlFor="post-status">Status</label>
          <select
            id="post-status"
            className="form-input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="post-form-actions">
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading || !title.trim() || !content.trim()}
          id="post-submit-btn"
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
