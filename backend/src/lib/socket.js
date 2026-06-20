import express from 'express'
import http from 'http'

import {Server} from 'socket.io'

const app = express();

const server = http.createServer(app)
const alloworigin = (process.env.FRONTEND_URL || '').replace(/\/$/,'')
const corsOption = alloworigin ? {origin:alloworigin, credentials: true} : undefined
const io = new Server(server,{cors:corsOption})
const onlineUsers={}
const disconnectTimeouts={}
const GRACE_PERIOD=2000
const getUserSocketId=(userId)=>{
  return onlineUsers[userId]
}
const getOnlineUsers=()=>{
  return Object.keys(onlineUsers)
}
 io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId
    
    if(disconnectTimeouts[userId]){
      clearTimeout(disconnectTimeouts[userId])
      delete disconnectTimeouts[userId]
    }

    const wasAlreadyOnline=!!onlineUsers[userId]
    onlineUsers[userId]=socket.id;
     
    if(!wasAlreadyOnline){
      io.emit('getOnlineUsers',Object.keys(onlineUsers))
    }

  socket.on("requestOnlineUsers",()=>{
    socket.emit('getOnlineUsers',Object.keys(onlineUsers))
  })

 socket.on("disconnect",()=>{
   disconnectTimeouts[userId]=setTimeout(()=>{
     if(onlineUsers[userId]===socket.id){
       delete onlineUsers[userId]
       io.emit('getOnlineUsers',Object.keys(onlineUsers))
     }
     delete disconnectTimeouts[userId]
   },GRACE_PERIOD)
 })
})

export {app,server,getUserSocketId,getOnlineUsers,io}