import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      maxLength: [30, "Your name cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      validate: [validator.isEmail, "Please enter valid email address"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [8, "Your password must be longer than 8 characters"],
      select: false,
    },
    phone: {
      type: String,
      maxLength: [11, "Your phone number cannot exceed 11 characters"],
      validate: {
        validator: function (value) {
          return /^[0-9]{10,11}$/.test(value);
        },
        message: "Please enter a valid phone number",
      },
    },
    address: {
      type: String,
    },
    maritalStatus: {
      type: String,
      enum: {
        values: ["Single", "Married", "Divorced", "Widowed"],
        message: "Please select correct marital status",
      },
    },
    isFirstTime: {
      type: Boolean,
      default: true,
      select: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
      select: false,
    },
  },

  { timestamps: true }
);

userSchema.pre("save", async function (next) {

  if(this.isFirstTime){
    this.isFirstTime = false;
    return next();
  }

  if (!this.isModified("password")) {
    return next();
  }
  
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateOTP = function () {
  const otp = crypto.randomBytes(3).toString("hex");
  this.otp = crypto.createHash("sha256").update(otp).digest("hex");
  this.otpExpires = Date.now() + 10 * 60 * 1000;
  return otp;
}

userSchema.methods.verifyOTP = function (enteredOTP) {
  return crypto.createHash("sha256").update(enteredOTP).digest("hex") === this.otp && this.otpExpires > Date.now();
  
}

export const User = mongoose.model("User", userSchema);
