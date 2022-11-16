import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please Enter Your name"],
      trim: true,
      maxLength: [20, "Your name is upto 20 char long"],
    },
    account: {
      type: String,
      required: [true, "Please Enter Your E-mail or Phone number"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    online: {
      type: Array,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/davg6e0yh/image/upload/v1632832500/blog_site/avatardefault_92824_c4u8sm.png",
    },
    role: {
      type: String,
      default: "user", // admin
    },
    type: {
      type: String,
      default: "register", // Login
    },
    rf_token: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("users", userSchema);
