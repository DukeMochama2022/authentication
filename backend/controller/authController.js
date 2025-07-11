const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { transporter } = require("../config/nodemailer");
const {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} = require("../config/emailTemplates");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing details!" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    //sending welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to techSparks",
      text: `Welcome to techSparks website.Your account has been  created with email id: ${email}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully");
    } catch (err) {
      console.error("❌ Failed to send email:", err.message);
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and Password are required!" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid email!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password!" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User successfully logged in!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({ success: true, message: "Logged out!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//sending verification OTP to users email account.
const sendverifyOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified!" });
    }

    //generate 6-digit otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyOTP = otp;
    user.verifyOTPExpiredAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    //sending OTP to user
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account verification OTP!",
      // text: `Your OTP is  ${otp}. Verify your account using this OTP.`,
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Verification OTP sent to email" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  const { userId } = req.body;

  if (!otp) {
    return res.status(404).json({ success: false, message: "Missing OTP!" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found!" });
    }

    if (user.verifyOTP === "" || user.verifyOTP !== otp) {
      return res.json({ success: false, message: "Invalid OTP!" });
    }

    if (user.verifyOTPExpiredAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired!" });
    }

    user.isAccountVerified = true;
    user.verifyOTP = "";
    user.verifyOTPExpiredAt = 0;
    await user.save();

    return res.json({
      success: true,
      message: "Email verified successfully!",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// check if user is authenticated
const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//send password reset OTP
const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Email is required!" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found!" });
    }
    //otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: " Password Reset OTP!",
      // text: `Your OTP  for reseting password is ${otp}.Reset your password using this OTP.`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };
    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "OTP sent to your email!" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Email,OTP, and new password are required!",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found!" });
    }
    if (user.resetOTP === "" || user.resetOTP !== otp) {
      return res.json({ success: false, message: "Invalid OTP!" });
    }
    if (user.resetOTPExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired!" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOTP = "";
    user.resetOTPExpireAt = 0;
    await user.save();

    return res.json({
      success: true,
      message: "Password has been reset successifully!",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  sendverifyOTP,
  verifyEmail,
  isAuthenticated,
  resetPassword,
  sendResetOtp,
};
