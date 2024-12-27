import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";

export const AdditionalDetails = catchAsyncError(async (req, res, next) => {
  const {address,phone, maritalStatus } = req.body;

  if(!address || !phone || !maritalStatus){
    return next(new ErrorHandler("Please fill all the fields", 400));
  }

  req.user.address = address;
  req.user.phone = phone;
  req.user.maritalStatus = maritalStatus;

  await req.user.save();

  res.status(200).json({
    success: true,
    message: "Additional details added successfully"
  })
})