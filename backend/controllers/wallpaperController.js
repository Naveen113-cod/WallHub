const Wallpaper = require('../models/Wallpaper');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all wallpapers with search, filter, pagination
// @route   GET /api/wallpapers
// @access  Public
const getWallpapers = async (req, res, next) => {
  try {
    const {
      search,
      category,
      sort = 'newest',
      page = 1,
      limit = 20,
      featured,
    } = req.query;

    const query = { isActive: true };

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Sort
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'popular':
        sortOption = { downloads: -1 };
        break;
      case 'liked':
        sortOption = { likes: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [wallpapers, total] = await Promise.all([
      Wallpaper.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate('uploadedBy', 'name'),
      Wallpaper.countDocuments(query),
    ]);

    // If user is logged in, add isLiked field
    let likedIds = [];
    if (req.user) {
      const user = await User.findById(req.user._id).select('likedWallpapers');
      likedIds = user.likedWallpapers.map((id) => id.toString());
    }

    const wallpapersWithLiked = wallpapers.map((w) => ({
      ...w.toObject(),
      isLiked: likedIds.includes(w._id.toString()),
    }));

    res.json({
      success: true,
      wallpapers: wallpapersWithLiked,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single wallpaper
// @route   GET /api/wallpapers/:id
// @access  Public
const getWallpaper = async (req, res, next) => {
  try {
    const wallpaper = await Wallpaper.findById(req.params.id).populate('uploadedBy', 'name');

    if (!wallpaper || !wallpaper.isActive) {
      return res.status(404).json({ success: false, message: 'Wallpaper not found' });
    }

    let isLiked = false;
    if (req.user) {
      const user = await User.findById(req.user._id).select('likedWallpapers');
      isLiked = user.likedWallpapers.some((id) => id.toString() === wallpaper._id.toString());
    }

    res.json({ success: true, wallpaper: { ...wallpaper.toObject(), isLiked } });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload wallpaper (Admin only)
// @route   POST /api/wallpapers
// @access  Admin
const uploadWallpaper = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const { title, description, category, tags, isFeatured } = req.body;

    // Create thumbnail URL (Cloudinary transformation)
    const thumbnailUrl = req.file.path.replace('/upload/', '/upload/w_400,h_300,c_fill,q_auto/');

    const wallpaper = await Wallpaper.create({
      title,
      description: description || '',
      category,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      imageUrl: req.file.path,
      thumbnailUrl,
      cloudinaryPublicId: req.file.filename,
      fileSize: req.file.size || 0,
      isFeatured: isFeatured === 'true',
      uploadedBy: req.user._id,
    });

    res.status(201).json({ success: true, wallpaper });
  } catch (error) {
    next(error);
  }
};

// @desc    Update wallpaper (Admin only)
// @route   PUT /api/wallpapers/:id
// @access  Admin
const updateWallpaper = async (req, res, next) => {
  try {
    const { title, description, category, tags, isFeatured } = req.body;

    const wallpaper = await Wallpaper.findById(req.params.id);
    if (!wallpaper) {
      return res.status(404).json({ success: false, message: 'Wallpaper not found' });
    }

    wallpaper.title = title || wallpaper.title;
    wallpaper.description = description !== undefined ? description : wallpaper.description;
    wallpaper.category = category || wallpaper.category;
    wallpaper.tags = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : wallpaper.tags;
    wallpaper.isFeatured = isFeatured !== undefined ? isFeatured === 'true' : wallpaper.isFeatured;

    await wallpaper.save();

    res.json({ success: true, wallpaper });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete wallpaper (Admin only)
// @route   DELETE /api/wallpapers/:id
// @access  Admin
const deleteWallpaper = async (req, res, next) => {
  try {
    const wallpaper = await Wallpaper.findById(req.params.id);
    if (!wallpaper) {
      return res.status(404).json({ success: false, message: 'Wallpaper not found' });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(wallpaper.cloudinaryPublicId);
    } catch (cloudErr) {
      console.error('Cloudinary delete error:', cloudErr.message);
    }

    // Remove from users' liked lists
    await User.updateMany(
      { likedWallpapers: wallpaper._id },
      { $pull: { likedWallpapers: wallpaper._id } }
    );

    await wallpaper.deleteOne();

    res.json({ success: true, message: 'Wallpaper deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Download wallpaper (increment count)
// @route   POST /api/wallpapers/:id/download
// @access  Private (verified user)
const downloadWallpaper = async (req, res, next) => {
  try {
    const wallpaper = await Wallpaper.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!wallpaper) {
      return res.status(404).json({ success: false, message: 'Wallpaper not found' });
    }

    res.json({ success: true, downloads: wallpaper.downloads, imageUrl: wallpaper.imageUrl });
  } catch (error) {
    next(error);
  }
};

// @desc    Like / Unlike wallpaper
// @route   POST /api/wallpapers/:id/like
// @access  Private (verified user)
const toggleLike = async (req, res, next) => {
  try {
    const wallpaper = await Wallpaper.findById(req.params.id);
    if (!wallpaper) {
      return res.status(404).json({ success: false, message: 'Wallpaper not found' });
    }

    const user = await User.findById(req.user._id);
    const alreadyLiked = user.likedWallpapers.some(
      (id) => id.toString() === wallpaper._id.toString()
    );

    if (alreadyLiked) {
      // Unlike
      await User.findByIdAndUpdate(req.user._id, { $pull: { likedWallpapers: wallpaper._id } });
      await Wallpaper.findByIdAndUpdate(wallpaper._id, {
        $inc: { likes: -1 },
        $pull: { likedBy: req.user._id },
      });
      return res.json({ success: true, liked: false, message: 'Wallpaper unliked' });
    } else {
      // Like
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { likedWallpapers: wallpaper._id } });
      await Wallpaper.findByIdAndUpdate(wallpaper._id, {
        $inc: { likes: 1 },
        $addToSet: { likedBy: req.user._id },
      });
      return res.json({ success: true, liked: true, message: 'Wallpaper liked' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's liked wallpapers
// @route   GET /api/wallpapers/liked
// @access  Private
const getLikedWallpapers = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'likedWallpapers',
      match: { isActive: true },
    });

    res.json({ success: true, wallpapers: user.likedWallpapers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wallpaper categories with counts
// @route   GET /api/wallpapers/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Wallpaper.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWallpapers,
  getWallpaper,
  uploadWallpaper,
  updateWallpaper,
  deleteWallpaper,
  downloadWallpaper,
  toggleLike,
  getLikedWallpapers,
  getCategories,
};
