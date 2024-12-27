import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { sendToken } from "../utils/jwtToken.js";
import { PendingUser } from "../models/PendingUserSchema.js";
export const resgisterConfirm = catchAsyncError(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new ErrorHandler("Please fill all the fields", 400));
  }

  const pendingUser = await PendingUser.findOne({ email }).select("+password");
  if (!pendingUser) {
    return next(new ErrorHandler("User does not exist", 400));
  }

  if (pendingUser.otp !== otp) {
    return next(new ErrorHandler("Invalid OTP", 400));
  }

  const timeDifference = Date.now() - pendingUser.otpExpires;
  if (timeDifference > 0) {
    return next(new ErrorHandler("OTP expired. Please resend OTP", 400));
  }

  const user = await User.create({
    name: pendingUser.name,
    email: pendingUser.email,
    password: pendingUser.password,
    isFirstTime: true,
  });

  await pendingUser.deleteOne();

  
  sendToken(user, 200, res, "User registered successfully");
  
})