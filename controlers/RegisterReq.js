import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import { PendingUser } from "../models/PendingUserSchema.js";
import ErrorHandler from "../middlewares/error.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendMail.js";

export const registerUserReq = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("Please fill all the fields", 400));
  }

  if (password.length < 8) {
    return next(new ErrorHandler("Password must be at least 8 characters", 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("User already exists", 400));
  }

  const pendingUser = await PendingUser.findOne({ email });
  if (pendingUser) {
    const passMatch = await pendingUser.comparePassword(password);
    if (!passMatch) {
      return next(
        new ErrorHandler(
          "User exists. Please enter the correct password to resend the OTP.",
          400
        )
      );
    }

    pendingUser.otp = crypto.randomBytes(3).toString("hex");
    pendingUser.otpExpires = Date.now() + 10 * 60 * 1000;
    await pendingUser.save();

    try {
      const emailContent = `Your OTP for verification is ${pendingUser.otp}. It will expire in 10 minutes.`;
      const subject = "Verify Your Email";

      await sendEmail({
        email: pendingUser.email,
        subject,
        message: emailContent,
      });

      return res.status(200).json({
        success: true,
        message: "OTP sent to your email",
      });
    } catch (error) {
      return next(new ErrorHandler("Failed to send email. Please try again.", 500));
    }
  }

  const otp = crypto.randomBytes(3).toString("hex");
  const otpExpires = Date.now() + 10 * 60 * 1000;

  const newPendingUser = await PendingUser.create({
    name,
    email,
    password,
    otp,
    otpExpires,
  });

  try {
    const emailContent = `Your OTP for verification is ${otp}. It will expire in 10 minutes.`;
    const subject = "Verify Your Email";

    await sendEmail({
      email: newPendingUser.email,
      subject,
      message: emailContent,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    await PendingUser.deleteOne({ email: newPendingUser.email });
    return next(new ErrorHandler("Failed to send email. Please try again.", 500));
  }
});
