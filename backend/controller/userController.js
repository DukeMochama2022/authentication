const User = require("../models/User");

const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById({userId });
    if (!user) {
      return res.json({ success: false, message: "User not found!" });
    }

    res.json({
      success: true,
      userData: {
        name: user.name,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    res.json({ success: true, message: error.message });
  }
};

module.exports = getUserData;
