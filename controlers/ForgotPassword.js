import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import ErrorHandler from "../middlewares/error.js"
import { User } from "../models/userSchema.js"
import { sendEmail } from "../utils/sendMail.js"

export const forgotPassOTPRequest = catchAsyncError(async (req, res, next) => {
  const {name, email } = req.body;

  if(!name || !email){
    return next(new ErrorHandler("Please fill all the fields", 400));
  }

  const user = await User.findOne({email})
  if(!user){
    return next(new ErrorHandler("User not found", 400));
  }

  if(user.name !== name){
    return next(new ErrorHandler("please enter correct name", 400));
  }

  const otp = user.generateOTP();
  await user.save({ validateBeforeSave: false });

  try {
    const emailContent = `Your OTP for verification is ${otp}. It will expire in 10 minutes.`;
    const subject = "Verify Your Email";

    await sendEmail({
      email: user.email,
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


export const forgotPassOTPVerify = catchAsyncError(async (req, res, next) => {
  const { email ,otp,newPassword } = req.body;

  if (!otp || !email || !newPassword) {
    return next(new ErrorHandler("Please enter the details", 400));
  }


  if(newPassword.length < 8){
    return next(new ErrorHandler("Password must be at least 8 characters long", 400));
  }

  const user = await User.findOne({ email }).select("+otp +otpExpires +password");
  if(!user){
    return next(new ErrorHandler("User not found", 400));
  }
  const isOTPValid = await user.verifyOTP(otp);
  if (!isOTPValid) {
    return next(new ErrorHandler("OTP is incorrect", 400));
  }

  if (user.otpExpires < Date.now()) {
    return next(new ErrorHandler("OTP has been expired. Please request a new one", 400));
  }

  const comparePass = await user.comparePassword(newPassword);
  if(comparePass){
    return next(new ErrorHandler("this is your current password please enter a different password", 400));
  }


  user.password = newPassword;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  })

})

export const forgotpasswordOtpResend = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Please enter your email", 400));
  }

  const user = await User.findOne({ email }).select("+otp +otpExpires");

  if (!user) {
    return next(new ErrorHandler("User not found", 400));
  }

  if(user.updatedAt.getTime() > Date.now() - 60000){
    return next(new ErrorHandler("Please wait for 1 minute before requesting for OTP", 400));
  }

  const otp = user.generateOTP();
  await user.save({ validateBeforeSave: false });

  try {
    const emailContent = `Your OTP for verification is ${otp}. It will expire in 10 minutes.`;
    const subject = "Verify Your Email";

    await sendEmail({
      email: user.email,
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