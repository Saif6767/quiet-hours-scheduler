import User from "../models/User.js";

// ➕ Create User (from Supabase signup)
export const createUser = async (req, res) => {
  const { email, supabaseId } = req.body;
  if (!email || !supabaseId) {
    return res.status(400).json({ error: "Email and Supabase ID required" });
  }

  try {
    const existing = await User.findOne({ supabaseId });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const user = new User({ email, supabaseId });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
