const express = require("express");
const { getAllUsers, getUserById } = require("../controllers/user.controller");
const { adminMiddleware, authMiddleware, } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, adminMiddleware, getAllUsers);
router.get("/:id", authMiddleware, getUserById);

module.exports = router;
