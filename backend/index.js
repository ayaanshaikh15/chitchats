import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./src/DB/index.js";
import dns from "dns";
import authRouter from "./src/Routes/auth.js";
import userRouter from "./src/Routes/user.js";
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT;

dns.setServers(["1.1.1.1", "8.8.8.8"]);

app.use("/api/auth", authRouter);
app.use("/api/user",userRouter);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
