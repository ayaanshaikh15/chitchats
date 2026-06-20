import express from 'express'
import http from 'http'

import {Server} from 'socket.io'

const app = express();

const server = http.createServer(app)
const alloworigin = (process.env.FRONTEND_URL || '').replace(/\/$/,'')
const corsOption = alloworigin ? {origin:alloworigin, credentials: true} : undefined
const io = new Server(server,{cors:corsOption})
const onlineUsers={}
const getUserSocketId=(userId)=>{
  return onlineUsers[userId]
}
const getOnlineUsers=()=>{
  return Object.keys(onlineUsers)
}
 io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId
    onlineUsers[userId]=socket.id;
     
    io.emit('getOnlineUsers',Object.keys(onlineUsers))

  socket.on("requestOnlineUsers",()=>{
    socket.emit('getOnlineUsers',Object.keys(onlineUsers))
  })

 socket.on("disconnect",()=>{
   if(userId) delete onlineUsers[userId]
    io.emit('getOnlineUsers',Object.keys(onlineUsers))
 })
})

export {app,server,getUserSocketId,getOnlineUsers,io}