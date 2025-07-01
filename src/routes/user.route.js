const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} = require("../controllers/user.controller");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/auth.middleware");
const { validateGetAllUsers, validateUserUpdate, validateUserDelete, validateGetUserById } = require("../middlewares/user.middleware");

const router = express.Router();

// Hanya admin yang boleh melihat semua user
router.get("/", authMiddleware, adminMiddleware, validateGetAllUsers, getAllUsers);

// Bisa diakses oleh user itu sendiri atau admin
router.get("/:id", authMiddleware, validateGetUserById, getUserById);

// Hanya admin yang boleh mengubah atau menghapus user
router.put("/:id", authMiddleware, adminMiddleware, validateUserUpdate, updateUserById);
router.delete("/:id", authMiddleware, adminMiddleware, validateUserDelete, deleteUserById);

module.exports = router;
