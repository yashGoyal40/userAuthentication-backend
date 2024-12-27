import { catchAsyncError } from "../middlewares/catchAsyncError.js";

export const logout = catchAsyncError(async (req, res, next) => {

 res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });

});