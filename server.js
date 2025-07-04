const app = require("./src/app");
const cron = require("node-cron");
const prisma = require("./src/prisma/client");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

// Cron Job: Hapus booking jika waktu sudah lewat
cron.schedule("* * * * *", async () => {
  const now = new Date();

  try {
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: "approved", // bisa diganti jadi "pending" sesuai logika kamu
        date: {
          lte: now,
        },
      },
    });

    for (const booking of expiredBookings) {
      const [hour, minute] = booking.time_slot.split(":");
      const bookingEnd = new Date(booking.date);
      bookingEnd.setHours(Number(hour), Number(minute), 0, 0);

      if (bookingEnd < now) {
        await prisma.booking.delete({
          where: { id: booking.id },
        });
        console.log(`Booking ID ${booking.id} dihapus otomatis`);
      }
    }
  } catch (err) {
    console.error("Gagal menjalankan cron job:", err.message);
  }
});
