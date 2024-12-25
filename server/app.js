const express = require("express");
const bodyParser = require('body-parser');
const cors=require('cors')
const app=express({
  limit:"50mb",
});
app.use(cors({ 
  origin: '*' 
})); 
const authRouter=require('./controllers/authController')
const userRouter=require('./controllers/userController')
const chatRouter=require('./controllers/chatController')
const messageRouter=require('./controllers/messageController')

// use auth controller

app.use(express.json())

const server=require('http').createServer(app);
const io=require('socket.io')(server,{cors:{
  origin:'*',
  methods:['GET','POST']
}})

app.use('/api/auth',authRouter)
app.use('/api/user',userRouter)
app.use('/api/chat',chatRouter)
app.use('/api/message',messageRouter)

//global variable
let onlineUser=[];

//Test socket connection
io.on('connection',socket=>{
  socket.on('join-room',(userId)=>{
      socket.join(userId);
      //console.log("user joined:"+userId)      
  })

  socket.on('send-message',(message)=>{
    console.log(message);
    io.to(message.members[0])
           .to(message.members[1])
           .emit('receive-message',message)
    
    io.to(message.members[0])
           .to(message.members[1])
           .emit('set-message-count',message)
  })

  socket.on('clear-unread-messages',(data)=>{
      io.to(data.members[0])
         .to(data.members[1])
         .emit('message-count-clear',data)
  })

  socket.on('user-typing',(data)=>{
    console.log(data);
    console.log('user-typing is emmitted');
    io.to(data.members[0])
         .to(data.members[1]).emit('started-typing',data)   
  })

  socket.on('user-login',(userId)=>{
      if(!onlineUser.includes(userId)){
          onlineUser.push(userId);
      }  
    console.log("online after login",onlineUser)
    io.emit('online-users',onlineUser);
  })
  socket.on('logout',(userId)=>{
      console.log(`User ${userId} logged out.`);
      const updatedOnlineUsers = onlineUser.filter((onlineUserId) => onlineUserId !== userId);
      onlineUser= updatedOnlineUsers;
      console.log("online after logout",onlineUser);
      io.emit('online-users-updated', onlineUser);
   })
})

module.exports=server;