import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import crypto from "crypto";
import { PendingUser } from "../models/PendingUserSchema.js";
import { sendEmail } from "../utils/sendMail.js";

export const resendOtp = catchAsyncError(async (req, res, next) => {

  const { email } = req.query;

  if (!email) {
    return next(new ErrorHandler("Please enter your email", 400));
  }

  const pendingUser = await PendingUser.findOne({ email });
  if(!pendingUser) {
    return next(new ErrorHandler("User does not exist", 400));
  }
  
  const timeDifference = Date.now() - pendingUser.updatedAt.getTime();
  if (timeDifference < 2 * 60 * 1000) { 
    return next(new ErrorHandler("Please wait for 2 minutes before resending the OTP", 400));
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


})