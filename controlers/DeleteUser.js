import { catchAsyncError } from "../middlewares/catchAsyncError.js";

export const deleteUser = catchAsyncError(async (req, res, next) => {
  await req.user.deleteOne();

  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "User Deleted succesfully",
    });
})