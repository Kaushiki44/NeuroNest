const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    thumbnail: {
      type: String,
      trim: true,
    },
    excerpt: {
      type: String,
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    commentCount: {
      type: Number,
      default: 0,
    },
    qualityScore: {
      type: Number,
      default: 0,
    },
    qualityFeedback: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Auto-generate excerpt from content before saving
postSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    // Only auto-generate if the user didn't explicitly modify the excerpt in this save
    if (!this.isModified('excerpt') || !this.excerpt || this.excerpt.includes('&nbsp;')) {
      // Strip HTML tags and entities for excerpt
      const plainText = this.content
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      this.excerpt = plainText.substring(0, 150).trim() + (plainText.length > 150 ? '...' : '');
    }
  }
  next();
});

// Index for efficient queries
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
