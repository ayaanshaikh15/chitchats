import express from 'express'
import http from 'http'

import {Server} from 'socket.io'

const app = express();

const server = http.createServer(app)
const alloworigin = process.env.FRONTEND_URL
const io = new Server(server,{cors:{origin:[alloworigin]}})
const onlineUsers={}
const getUserSocketId=(userId)=>{
  return onlineUsers[userId]
}
io.on("connection",(socket)=>{
    //getting the user id who is connect like 101
    const userId = socket.handshake.query.userId
    //store that user in object like {101:ffr342d22} because he is currently online
    onlineUsers[userId]=socket.id;
     
    //send event to everyone -boardcast
    io.emit('getOnlineUsers',Object.keys(onlineUsers))



 io.on("disconnect",()=>{
   if(userId) delete onlineUsers[userId]
   // again send event to everyone because there is change in onlineusers
    io.emit('getOnlineUsers',Object.keys(onlineUsers))
 })
})

export {app,server,getUserSocketId,io}