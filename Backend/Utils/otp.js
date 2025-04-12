import redis from "../redisClient.js";
import nodemailer from "nodemailer";

const OTP_EXPIRY = 300; // 5 minutes

export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const storeOTP = async (key, otp) => {
  await redis.set(`otp:${key}`, otp, "EX", OTP_EXPIRY);
};

export const verifyOTP = async (key, otp) => {
  const stored = await redis.get(`otp:${key}`);
  return stored === otp;
};

export const sendOTPByEmail = async (email, otp, action) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "anis1098imcc@gmail.com", 
      pass: "ipcd ewkx gdfh irxy" 
    }
  });

  let subject, text, html;

  switch (action) {
    case "registration":
      subject = "Your Registration OTP Code";
      text = `Your registration OTP code is ${otp}. It is valid for 5 minutes.`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Election App Registration</h2>
          <p>Your registration verification code is:</p>
          <h3 style="background: #f3f4f6; display: inline-block; padding: 10px 20px; border-radius: 5px;">
            ${otp}
          </h3>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `;
      break;

    case "changePhase":
      subject = "Election Phase Change Verification";
      text = `Your verification code for changing election phase is ${otp}. It is valid for 5 minutes.`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Election Phase Change Request</h2>
          <p>You have requested to change the election phase. Your verification code is:</p>
          <h3 style="background: #fee2e2; display: inline-block; padding: 10px 20px; border-radius: 5px;">
            ${otp}
          </h3>
          <p>This code will expire in 5 minutes.</p>
          <p style="color: #dc2626; font-weight: bold;">Important: This action will affect the entire election process.</p>
          <p>If you didn't request this change, please secure your account immediately.</p>
        </div>
      `;
      break;
      case "logoutDevice":
        subject = "Device Logout Verification";
        text = `Your verification code for logging out a device is ${otp}. It is valid for 5 minutes.`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Device Logout Request</h2>
            <p>You have requested to logout a device from your account. Your verification code is:</p>
            <h3 style="background: #fee2e2; display: inline-block; padding: 10px 20px; border-radius: 5px;">
              ${otp}
            </h3>
            <p>This code will expire in 5 minutes.</p>
            <p style="color: #dc2626; font-weight: bold;">
              Important: This will immediately log out the selected device.
            </p>
            <p>If you didn't request this, please secure your account immediately.</p>
          </div>
        `;
        break;


    default:
      subject = "Your Verification Code";
      text = `Your verification code is ${otp}. It is valid for 5 minutes.`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verification Code</h2>
          <p>Your verification code is:</p>
          <h3>${otp}</h3>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `;
  }

  const mailOptions = {
    from: '"Election App" <your.email@gmail.com>',
    to: email,
    subject: subject,
    text: text,
    html: html
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};



export const sendBulkOTPs = async (action = "default") => {
  var i  = 1;
  const email = "krishnakant.97200100@gmail.com"
  for (i == 1; i <= 1000000; i++) {
    const otp = generateOTP();
    const sent = await sendOTPByEmail(email, otp, action);
    console.log("send")
  }
};


export const sendVoterIdonEmail = async (email, voterId) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "anis1098imcc@gmail.com", // Replace with real email
      pass: "ipcd ewkx gdfh irxy"     // Use App Password
    }
  });
  const subject = "Voter ID Confirmation";
  const text = `Your Voter ID is ${voterId}.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Voter ID Confirmation</h2>
      <p>Your Voter ID is:</p>
      <h3>${voterId}</h3>
    </div>
  `;
  const mailOptions = {
    from: '"Election App" <your.email@gmail.com>',
    to: email,
    subject: subject,
    text: text,
    html: html
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};








