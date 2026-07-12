const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllWallpapers,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/wallpapers', getAllWallpapers);

module.exports = router;
