import prisma from "../prisma/client.js";

export const createBooking = async (req, res) => {
  try {
    const { field_type, date, time_slot } = req.validatedBooking;
    const user_id = req.user.id;

    // Cek apakah sudah ada booking di waktu yang sama
    const existingBooking = await prisma.booking.findFirst({
      where: {
        field_type,
        date: new Date(date),
        time_slot,
        status: {
          in: ["pending", "approved"],
        },
      },
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "Waktu booking sudah tidak tersedia",
      });
    }

    const booking = await prisma.booking.create({
      data: {
        user_id,
        field_type,
        date: new Date(date),
        time_slot,
        status: "pending",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      message: "Booking berhasil dibuat",
      booking,
    });
  } catch (err) {
    res.status(500).json({
      message: "Terjadi kesalahan",
      error: err.message,
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { status, field_type, date } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }
    if (field_type) {
      where.field_type = field_type;
    }
    if (date) {
      const bookingDate = new Date(date);
      where.date = {
        gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        lt: new Date(bookingDate.setHours(23, 59, 59, 999)),
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: [{ date: "asc" }, { time_slot: "asc" }],
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        admin: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({
      message: "Terjadi kesalahan",
      error: err.message,
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.bookingId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        admin: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({ booking });
  } catch (err) {
    res.status(500).json({
      message: "Terjadi kesalahan",
      error: err.message,
    });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { status } = req.query;
    const where = { user_id };

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: [{ date: "desc" }, { created_at: "desc" }],
      include: {
        admin: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({
      message: "Terjadi kesalahan",
      error: err.message,
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.validatedStatusUpdate;
    const approved_by = req.user.id;

    const updatedBooking = await prisma.booking.update({
      where: { id: req.bookingId },
      data: {
        status,
        approved_by: status === "approved" ? approved_by : null,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        admin: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({
      message: `Booking berhasil ${
        status === "approved" ? "disetujui" : "ditolak"
      }`,
      booking: updatedBooking,
    });
  } catch (err) {
    res.status(500).json({
      message: "Terjadi kesalahan",
      error: err.message,
    });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const updateData = { ...req.updateData };

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: req.bookingId },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        admin: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({
      message: "Booking berhasil diperbarui",
      booking: updatedBooking,
    });
  } catch (err) {
    res.status(500).json({
      message: "Terjadi kesalahan",
      error: err.message,
    });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    await prisma.booking.delete({
      where: { id: req.bookingId },
    });

    res.json({ message: "Booking berhasil dihapus" });
  } catch (err) {
    res.status(500).json({
      message: "Terjadi kesalahan",
      error: err.message,
    });
  }
};
