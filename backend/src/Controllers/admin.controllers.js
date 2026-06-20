import User from "../Models/userModel.js";
import { getOnlineUsers } from "../lib/socket.js";

export const getStats = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const onlineIds = getOnlineUsers();

    const usersWithStatus = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      profilePic: u.profilePic,
      role: u.role,
      isOnline: onlineIds.includes(u._id.toString()),
    }));

    const online = usersWithStatus.filter((u) => u.isOnline).length;
    const total = usersWithStatus.length;

    res.status(200).json({
      success: true,
      total,
      online,
      offline: total - online,
      users: usersWithStatus,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const makeAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.role === "admin") {
      return res.status(400).json({ success: false, message: "User is already an admin" });
    }
    user.role = "admin";
    await user.save();
    res.status(200).json({ success: true, message: `${user.name} is now an admin` });
  } catch (error) {
    console.error("Error making admin:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json({ success: true, admins });
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
