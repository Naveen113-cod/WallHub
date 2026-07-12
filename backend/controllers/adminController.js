const User = require('../models/User');
const Wallpaper = require('../models/Wallpaper');

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Admin
const getAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalWallpapers,
      totalDownloadsResult,
      totalLikesResult,
      recentUsers,
      recentWallpapers,
      categoryStats,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Wallpaper.countDocuments({ isActive: true }),
      Wallpaper.aggregate([{ $group: { _id: null, total: { $sum: '$downloads' } } }]),
      Wallpaper.aggregate([{ $group: { _id: null, total: { $sum: '$likes' } } }]),
      User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt isVerified'),
      Wallpaper.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).select('title category downloads likes createdAt thumbnailUrl'),
      Wallpaper.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 }, downloads: { $sum: '$downloads' } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const totalDownloads = totalDownloadsResult[0]?.total || 0;
    const totalLikes = totalLikesResult[0]?.total || 0;

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalWallpapers,
        totalDownloads,
        totalLikes,
        recentUsers,
        recentWallpapers,
        categoryStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { role: 'user' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-password'),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      users,
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

// @desc    Toggle user active status (ban/unban)
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot modify admin user' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: user.isActive ? 'User activated successfully' : 'User deactivated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin user' });
    }

    // Remove user's likes from wallpapers
    await Wallpaper.updateMany(
      { likedBy: user._id },
      { $inc: { likes: -1 }, $pull: { likedBy: user._id } }
    );

    await user.deleteOne();

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all wallpapers for admin (including inactive)
// @route   GET /api/admin/wallpapers
// @access  Admin
const getAllWallpapers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    const [wallpapers, total] = await Promise.all([
      Wallpaper.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('uploadedBy', 'name'),
      Wallpaper.countDocuments(query),
    ]);

    res.json({
      success: true,
      wallpapers,
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

module.exports = {
  getAnalytics,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllWallpapers,
};
