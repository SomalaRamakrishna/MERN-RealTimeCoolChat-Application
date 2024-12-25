import React, { useEffect, useState } from 'react'
import Header from './components/header'
import Sidebar from './components/sidebar'
import ChatArea from './components/chatArea'
import { useSelector } from 'react-redux'
import {io} from 'socket.io-client'


const socket=io('http://localhost:5000');

const Home = () => {
  const {selectedChat,user}=useSelector(state => state.userReducer);
  const [isMobile,setIsMobile]=useState(window.innerWidth <= 767)
   const [isShow,setIsShow]=useState(false);
  const [onlineUsers,setOnlineUsers]=useState([])
  console.log("isMobile",isMobile);

  useEffect(()=>{
    if(user){
       socket.emit('join-room',user._id);
       socket.emit('user-login',user._id);
       socket.on('online-users',allOnlineUsers=>{
          setOnlineUsers(allOnlineUsers);
          console.log("online after login",onlineUsers)
       });
       socket.on('online-users-updated',(updatedUsers) => {
        setOnlineUsers(updatedUsers);
        console.log("online after logoutupdated",onlineUsers)
       });
    }
  },[user])


  useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 767);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize); // Clean up
    }, []);

console.log("online after login",onlineUsers)
  return (
    <>
     <div className="home-page" >
               <Header socket={socket} isMobile={isMobile} isShow={isShow}></Header> 
             {isMobile &&  <div className="main-content" style={isMobile?{padding:"0px"}:{}}>
                 {!isShow  &&  <div style={{width:"100%"}}>
                      <Sidebar socket={socket} onlineUsers={onlineUsers} setIsShow={setIsShow} isMobile={isMobile}></Sidebar>
                  </div>} 
                   {isShow && <div style={{width:"100%",wordWrap: "breakWord",whiteSpace: "preWrap"}}>{selectedChat &&  <ChatArea socket={socket} onlineUsers={onlineUsers} setIsShow={setIsShow} isMobile={isMobile}></ChatArea>}
                   </div>}
             </div> } 
              
            {!isMobile &&  <div className="main-content">
                  <Sidebar socket={socket} onlineUsers={onlineUsers} setIsShow={setIsShow} isMobile={isMobile}></Sidebar>
                 {selectedChat &&  <ChatArea socket={socket} onlineUsers={onlineUsers} setIsShow={setIsShow} isMobile={isMobile}></ChatArea>}
            </div> }
     </div>
    </>
  )
}

export default Home