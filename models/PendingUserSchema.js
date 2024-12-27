import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const pendingUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: [30, "Your name cannot exceed 30 characters"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpires: {
    type: Date,
    required: true,
  },
},{
  timestamps: true,
});

pendingUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

pendingUserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
}

export const PendingUser = mongoose.model("PendingUser", pendingUserSchema);
