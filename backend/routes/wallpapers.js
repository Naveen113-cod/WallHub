const express = require('express');
const router = express.Router();
const {
  getWallpapers,
  getWallpaper,
  uploadWallpaper,
  updateWallpaper,
  deleteWallpaper,
  downloadWallpaper,
  toggleLike,
  getLikedWallpapers,
  getCategories,
} = require('../controllers/wallpaperController');
const { protect, adminOnly, verifiedOnly, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Public routes (with optional auth for isLiked)
router.get('/', optionalAuth, getWallpapers);
router.get('/categories', getCategories);
router.get('/liked', protect, getLikedWallpapers);
router.get('/:id', optionalAuth, getWallpaper);

// Verified user routes
router.post('/:id/download', protect, verifiedOnly, downloadWallpaper);
router.post('/:id/like', protect, verifiedOnly, toggleLike);

// Admin routes
router.post('/', protect, adminOnly, upload.single('image'), uploadWallpaper);
router.put('/:id', protect, adminOnly, updateWallpaper);
router.delete('/:id', protect, adminOnly, deleteWallpaper);

module.exports = router;
