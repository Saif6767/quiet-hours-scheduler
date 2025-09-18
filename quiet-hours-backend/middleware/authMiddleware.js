import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const supabaseId = req.header("supabaseId"); 

    if (!supabaseId) {
      return res.status(401).json({ error: "Not authorized, supabaseId missing" });
    }

    const user = await User.findOne({ supabaseId });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user; 
    next();
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
