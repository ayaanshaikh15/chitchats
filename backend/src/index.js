import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./lib/index.js";
import dns from "dns";
import authRouter from "./Routes/auth.js";
import userRouter from "./Routes/user.js";
import cookieParser from "cookie-parser";
import path from 'path'
import fs from 'fs'
import job from "./lib/cron.js";
dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT;
const FRONTEND_URL=process.env.FRONTEND_URL;
dns.setServers(["1.1.1.1", "8.8.8.8"]);
app.use(cors({origin: FRONTEND_URL, credentials: true}));
app.use("/api/auth", authRouter);
app.use("/api/user",userRouter);

const publicDir = path.join(process.cwd(),'public')

if(fs.existsSync(publicDir)){
  app.use(express.static(publicDir));
  app.get('/{*any}',(req,res,next)=>{
    res.sendFile(path.join(publicDir,'index.html'),(err)=>next(err))
  })
}
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
  if(process.env.NODE_ENV === "production") {
    job.start()
  }
});
