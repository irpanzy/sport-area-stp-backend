import prisma from "../prisma/client.js";

export const getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "ID tidak valid" });
    }

    const isSelf = req.user.id === userId;
    const isAdmin = req.user.role === "admin";

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        message:
          "Akses ditolak: hanya pemilik akun atau admin yang dapat mengakses data ini",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({
      message: "Terjadi kesalahan",
      error: err.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    res.json({ users });
  } catch (err) {
    res.status(500).json({
      message: "Terjadi kesalahan",
      error: err.message,
    });
  }
};
