const mongoose = require('mongoose');

const wallpaperSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Nature',
        'Abstract',
        'Architecture',
        'Space',
        'Animals',
        'Technology',
        'Minimal',
        'Dark',
        'Colorful',
        'Cars',
        'Travel',
        'Art',
        'Gaming',
        'Sports',
        'Other',
      ],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    resolution: {
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
wallpaperSchema.index({ title: 'text', description: 'text', tags: 'text' });
wallpaperSchema.index({ category: 1 });
wallpaperSchema.index({ downloads: -1 });
wallpaperSchema.index({ likes: -1 });
wallpaperSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Wallpaper', wallpaperSchema);
