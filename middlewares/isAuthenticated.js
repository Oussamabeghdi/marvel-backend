const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = req.headers.authorization.replace("Bearer ", "");

    const user = await User.findOne({ user: user }).select("account");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized Authenticated" });
    }
    req.user = user;

    next();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
module.exports = isAuthenticated;
