const express = require("express");
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const bookingRoute = require("./booking.route");

const router = express.Router();

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/bookings", bookingRoute);

module.exports = router;
