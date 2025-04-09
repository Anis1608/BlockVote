import redis from "../redisClient.js";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

const OTP_EXPIRY = 300; // 5 minutes

export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const storeOTP = async (key, otp) => {
  await redis.set(`otp:${key}`, otp, "EX", OTP_EXPIRY);
};

export const verifyOTP = async (key, otp) => {
  const stored = await redis.get(`otp:${key}`);
  return stored === otp;
};

export const sendOTPByEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "anis1098imcc@gmail.com", // Replace with real email
      pass: "ipcd ewkx gdfh irxy"     // Use App Password
    }
  });

  const mailOptions = {
    from: '"Election App" <your.email@gmail.com>',
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};
