import prisma from "../prisma/client.js";
import fs from "fs";
import path from "path";

// Fungsi helper untuk generate PDF content (simplified)
const generatePDFContent = (booking) => {
  return `
LAPORAN BOOKING LAPANGAN OLAHRAGA
=====================================

ID Booking: ${booking.id}
Nama Pemesan: ${booking.user.name}
Email: ${booking.user.email}
Jenis Lapangan: ${booking.field_type.toUpperCase()}
Tanggal: ${new Date(booking.date).toLocaleDateString("id-ID")}
Waktu: ${booking.time_slot}
Status: ${booking.status.toUpperCase()}
Tanggal Booking: ${new Date(booking.created_at).toLocaleDateString("id-ID")}

${booking.admin ? `Disetujui oleh: ${booking.admin.name}` : ""}

Catatan:
- Laporan ini dibuat secara otomatis
- Harap bawa laporan ini saat menggunakan lapangan
- Untuk pertanyaan hubungi admin

Dibuat pada: ${new Date().toLocaleString("id-ID")}
  `;
};

export const generateReport = async (req, res) => {
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

    if (booking.status !== "approved") {
      return res.status(400).json({
        message:
          "Laporan hanya dapat dibuat untuk booking yang sudah disetujui",
      });
    }

    // Cek apakah report sudah ada
    const existingReport = await prisma.report.findUnique({
      where: { booking_id: req.bookingId },
    });

    if (existingReport) {
      return res.status(400).json({
        message: "Laporan untuk booking ini sudah pernah dibuat",
      });
    }

    // Generate filename
    const fileName = `booking-report-${booking.id}-${Date.now()}.txt`;
    const uploadDir = path.join(process.cwd(), "uploads", "reports");

    // Pastikan direktori ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    const relativePath = path.join("uploads", "reports", fileName);

    // Generate content dan simpan file
    const pdfContent = generatePDFContent(booking);
    fs.writeFileSync(filePath, pdfContent);

    // Simpan ke database
    const report = await prisma.report.create({
      data: {
        booking_id: req.bookingId,
        file_name: fileName,
        file_path: relativePath,
      },
    });

    res.status(201).json({
      message: "Laporan berhasil dibuat",
      report: {
        id: report.id,
        booking_id: report.booking_id,
        file_name: report.file_name,
        generated_at: report.generated_at,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Terjadi kesalahan",
      error: err.message,
    });
  }
};

export const downloadReport = async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.reportId },
      include: {
        booking: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    const filePath = path.join(process.cwd(), report.file_path);

    // Cek apakah file ada
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "File laporan tidak ditemukan",
      });
    }

    // Set headers untuk download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${report.file_name}"`
    );
    res.setHeader("Content-Type", "text/plain");

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    res.status(500).json({
      message: "Terjadi kesalahan",
      error: err.message,
    });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const { booking_id } = req.query;
    const where = {};

    if (booking_id) {
      where.booking_id = parseInt(booking_id);
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: { generated_at: "desc" },
      include: {
        booking: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            admin: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    res.json({ reports });
  } catch (err) {
    res.status(500).json({
      message: "Terjadi kesalahan",
      error: err.message,
    });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.reportId },
      include: {
        booking: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            admin: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    res.json({ report });
  } catch (err) {
    res.status(500).json({
      message: "Terjadi kesalahan",
      error: err.message,
    });
  }
};

export const getUserReports = async (req, res) => {
  try {
    const user_id = req.user.id;

    const reports = await prisma.report.findMany({
      where: {
        booking: {
          user_id,
        },
      },
      orderBy: { generated_at: "desc" },
      include: {
        booking: {
          select: {
            id: true,
            field_type: true,
            date: true,
            time_slot: true,
            status: true,
          },
        },
      },
    });

    res.json({ reports });
  } catch (err) {
    res.status(500).json({
      message: "Terjadi kesalahan",
      error: err.message,
    });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.reportId },
    });

    const filePath = path.join(process.cwd(), report.file_path);

    // Hapus file jika ada
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Hapus dari database
    await prisma.report.delete({
      where: { id: req.reportId },
    });

    res.json({ message: "Laporan berhasil dihapus" });
  } catch (err) {
    res.status(500).json({
      message: "Terjadi kesalahan",
      error: err.message,
    });
  }
};
