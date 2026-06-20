import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./lib/db.js";
import dns from "dns";
import authRouter from "./Routes/auth.js";
import msgRouter from "./Routes/msg.js";
import adminRouter from "./Routes/admin.js";
import cookieParser from "cookie-parser";
import path from 'path'
import fs from 'fs'
import job from "./lib/cron.js";
import {app,server} from './lib/socket.js'
dotenv.config();


app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT;
const FRONTEND_URL=(process.env.FRONTEND_URL || '').replace(/\/$/,'');
dns.setServers(["1.1.1.1", "8.8.8.8"]);
if (FRONTEND_URL) {
  app.use(cors({origin: FRONTEND_URL, credentials: true}));
}
app.use("/api/auth", authRouter);
app.use("/api/messages",msgRouter);
app.use("/api/admin",adminRouter);

const publicDir = path.join(process.cwd(),'public')

if(fs.existsSync(publicDir)){
  app.use(express.static(publicDir));
  app.get('/{*any}',(req,res,next)=>{
    res.sendFile(path.join(publicDir,'index.html'),(err)=>next(err))
  })
}

server.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
  if(process.env.NODE_ENV === "production") {
    job.start()
  }
});
