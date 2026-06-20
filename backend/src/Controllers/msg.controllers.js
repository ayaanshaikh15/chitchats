import mongoose from "mongoose";
import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";
import { getUserSocketId, io } from "../lib/socket.js";
import Message from "../Models/messageModel.js";
import User from '../Models/userModel.js'
export const getUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;

    const users = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const getConversationsForSidebar = async (req, res) => {
    try{
        const loggedInUserId = req.user.userId;

    const conversations = await Message.aggregate([
      { $match: { $or: [{ senderId: new mongoose.Types.ObjectId(loggedInUserId) }, { receiverId: new mongoose.Types.ObjectId(loggedInUserId) }] } },
      {
        $group: {
          _id: { $cond: [{ $eq: ["$senderId", new mongoose.Types.ObjectId(loggedInUserId)] }, "$receiverId", "$senderId"] },
          lastMessageAt: { $max: "$createdAt" },
        },
      },
      { $sort: { lastMessageAt: -1 } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ $first: "$user" }, { lastMessageAt: "$lastMessageAt" }],
          },
        },
      },
      { $project: { password: 0 } },
    ]);

    res.status(200).json(conversations);
    }catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}
export const getMessage = async (req, res) => {
    try{
      const { id: userToChatId } = req.params;
    const myId = req.user.userId;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
    }catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}
export const sendMessage = async (req, res) => {
    try{
  const {id:receiverId} = req.params;
  const {text} = req.body;
  const senderId = req.user.userId;
  let ImageUrl;
  let VideoUrl;
  if(req.file)
 { 
    if(!hasImageKitConfig()) 
        return res.status(500).json({
      message: "Internal server error",
    });
   const url =await uploadChatMedia(req.file)

    if(req.file.mimetype.startsWith("image/")){
        ImageUrl = url
    }else if(req.file.mimetype.startsWith("video/")){
        VideoUrl = url;
    }
}
   const message = new Message({
   senderId,
    receiverId,
    text,
    image: ImageUrl,
    video: VideoUrl
   })

   await message.save();
   //socket io code 
   //show the msg to the user if the user in online or else just save it in db
   const receiverSocketId = getUserSocketId(receiverId)
   if(receiverId)
   {
    //send msg to the provided receiver socket id
    io.to(receiverSocketId).emit("newMessage",message)
   }
     res.status(201).json(message);
  
    }catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}