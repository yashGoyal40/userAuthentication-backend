import express from "express";

import {
  registerUserReq,
  resendOtp,
  resgisterConfirm,
  AdditionalDetails,
  Login,
  logout,
  getUser,
  deleteUser,
  updatePassword,
  forgotPassOTPRequest,
  forgotPassOTPVerify,
  forgotpasswordOtpResend,
} from "../controlers/index.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", registerUserReq);
router.put("/resend-otp", resendOtp);
router.post("/register-confirm", resgisterConfirm);

router.post("/login", Login);

router.post("/forgot-password", forgotPassOTPRequest);
router.put("/forgot-password", forgotPassOTPVerify);
router.put("/forgot-password-resend", forgotpasswordOtpResend);

router.post("/additional-details", isAuthenticated, AdditionalDetails);
router.get("/user", isAuthenticated, getUser);
router.delete("/user", isAuthenticated, deleteUser);
router.put("/update-password", isAuthenticated, updatePassword);

router.get("/logout", isAuthenticated, logout);

export default router;
