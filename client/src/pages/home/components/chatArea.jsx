import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { hideLoader, showLoader } from '../../../redux/loaderSlice';
import moment from 'moment';
import store from '../../../redux/store'
import { setAllChats, setSelectedChat } from '../../../redux/userSlice';
import EmojiPicker from 'emoji-picker-react'

const ChatArea = ({socket,onlineUsers,setIsShow,isMobile}) => {
    const {selectedChat,user,allChats} =useSelector(state => state.userReducer);
    const dispatch=useDispatch(); 
    const [message,setMessage]=useState('');
    const [allMessages,setAllMessages]=useState([]);
    const [isTyping,setIsTyping]=useState(false);
    const [data,setData]=useState(null);
     //console.log("selectedChat:",selectedChat);
     const [showEmojiPicker,setShowEmojiPicker]=useState(false);
     const selectedUser = selectedChat.members.find(u => u._id !== user._id);
  
    let image=null;

const formatTime=(timestamp)=>{
      const now=moment();
      const diff=now.diff(moment(timestamp),'days')
      if(diff <1){
        return `Today ${moment(timestamp).format('hh:mm A')}`;
      }
      else if(diff==1){
        return `Yesterday ${moment(timestamp).format('hh:mm A')}`;
      }
      else{
        return moment(timestamp).format('MMM D,hh:mm A');
      }
      
    }
  const sendMessage=async(e)=>{    
         e?.preventDefault();
         try {
                if (message.trim() === "" && image === null) {
                     toast.error("Input Cannot Be Empty,Please Type Something");
                       return;
                    }
          setShowEmojiPicker(false);
          const newMessage={
                    chatId: selectedChat._id,
                    sender:user._id,
                    text:message,
                    image,
          }
         

          socket.emit('send-message',{
            ...newMessage,
              members:selectedChat.members.map(m=> m._id),
              read:false,
              createdAt:moment().format("YYYY-MM-DD hh:mm:ss")
          })
         // dispatch(showLoader());
          const response=await fetch("http://localhost:5000/api/message/new-message",{
              method:"POST",
              headers: {
                    Authorization: `Bearer ${localStorage.getItem('logInToken')}`,
                     'Content-Type': 'application/json' ,
                    },
                     body: JSON.stringify(newMessage) 
              });
              //  console.log("message created",response);
              //dispatch(hideLoader());

                if (response.ok) {
                    const newMessageData = await response.json();
                    

                  //console.log("newMessageData:",newMessageData)
                   setMessage('');
                   image=null;
                   
                } else {
                    toast.error("Server Response Invalid,Please Try Again..!")
                    image=null;
                }
                } catch (error) {
                dispatch(hideLoader())
                toast.error("Internal Server Error");                
                }
            } 
     const getAllMessages=async()=>{
         try {
          dispatch(showLoader());
          const response=await fetch(`http://localhost:5000/api/message/get-all-messages/${selectedChat._id}`,{
             headers: {
                    Authorization: `Bearer ${localStorage.getItem('logInToken')}`,
                    },
                    
                });
             
              dispatch(hideLoader());

                if (response.ok) {
                    const chatMessagesData= await response.json();
                   setAllMessages(chatMessagesData.data); 
                } else {
                    toast.error("Server Response Invalid,Please Try Again..!")
                }
                } catch (error) {
                dispatch(hideLoader())
                toast.error("Internal Server Error");
                //console.log(error,error.message)
                }
            }
    const updateUnreadMessageCount=async()=>{
          try {
            
            socket.emit('clear-unread-messages',{
              chatId:selectedChat._id,
              members:selectedChat.members.map(m=> m._id)
            })
          const response=await fetch("http://localhost:5000/api/chat/clear-unread-message",{
            method:"POST",
             headers: {
                    Authorization: `Bearer ${localStorage.getItem('logInToken')}`,
                     'Content-Type': 'application/json' ,
                    },
                     body: JSON.stringify({chatId:selectedChat._id}) 
                });
           
             // dispatch(hideLoader());

                if (response.ok) {
                    const updatedChatData = await response.json();
                    allChats.map(chat=>{
                       if(chat._id===selectedChat._id){
                         return updatedChatData.data;
                       }
                       return chat;
                    })
                                     
                } else {
                    toast.error("Server Response Invalid,Please Try Again..!")
                }
                } catch (error) {
               // dispatch(hideLoader())
                toast.error("Internal Server Error");
                console.log(error,error.message)
                }
            
    }
      

   const formatName=(user)=>{
        let fname=user.firstname.at(0).toUpperCase()+ user.firstname.slice(1).toUpperCase();
        let lname=user.lastname.at(0).toUpperCase()+ user.lastname.slice(1).toUpperCase();
        return fname+' '+lname;
    }

    const sendImage=async(e)=>{
        const file=e.target.files[0];
        console.log(file)
        const reader = new FileReader(file);
        console.log(reader);
       
       
       reader.onloadend = async () => {
       // console.log("File loaded:", reader.result); // Check if the file is loaded correctly
        
        //console.log("Image state set:", image); // Check if state is set correctly
        image=reader.result
       // console.log("After Image state set:", image);
        await sendMessage();
    };
        
       reader.onerror = () => {
        toast.error("Error reading file");
      };
      reader.readAsDataURL(file);
      //console.log("file reading started")
    }

    
       
    useEffect(()=>{
           setMessage('')
          getAllMessages();
          if(selectedChat?.lastMessage?.sender !== user._id){
             updateUnreadMessageCount();
          }
          /* socket.off('receive-message') */
          socket.off('receive-message').on('receive-message',(message)=>{
            const selectedChat= store.getState().userReducer.selectedChat;
            if(selectedChat._id=== message.chatId){
            setAllMessages(prevmsg=>[...prevmsg,message])
            }
            if(selectedChat._id === message.chatId && message.sender !== user._id){
              updateUnreadMessageCount();
            }
          })

          socket.on('message-count-clear',data=>{
            console.log("message-count-clear emitted")
            const selectedChat=store.getState().userReducer.selectedChat;
            const allChats=store.getState().userReducer.allChats;
            //updating unread message count in chat object
            if(selectedChat._id === data.chatId){
              const updatedChats =allChats.map(chat =>{
                if(chat._id=== data.chatId){
                  return {...chat,unreadMessageCount:0};
                }
                return chat;
              })
              dispatch(setAllChats(updatedChats));
           //updating read property in message object
              setAllMessages(prevMsgs =>{
                return prevMsgs.map(msg=>{
                  return {...msg,read:true}
                })
              })
            }
          });
         
         socket.on('started-typing',(data)=>{
          console.log("typing...........!",data)
          const selectedChat=store.getState().userReducer.selectedChat;
          setData(data);
           
            if(selectedChat._id=== data.chatId && data.sender!==user._id){
              setIsTyping(true);
              setTimeout(()=>{
                setIsTyping(false);
              },2000) 
            }
         })     
        },[selectedChat])

        useEffect(()=>{
             const msgContainer=document.getElementById('main-chat-area');
             msgContainer.scrollTop =msgContainer.scrollHeight;
        },[allMessages,isTyping])
        console.log("chat area called");
      
  return (
    <>
    {selectedChat && <div className='app-chat-area' style={isMobile?{padding:"5px 5px"}:{}}>
                <div className='app-chat-area-header' style={isMobile?{padding:"0px 5px"}:{}}>
                  <div>{isMobile && <i class="fa fa-arrow-left" aria-hidden="true" onClick={()=>{setIsShow(false);dispatch(setSelectedChat(null))}} style={{fontSize:"20px"}}></i>}</div> 
                 <div>{formatName(selectedUser)}
                 {onlineUsers?.includes(selectedUser?._id)?<h6>Online</h6>:<></>}
                 </div>
                </div>
                <div className='main-chat-area' id='main-chat-area' >
                  {allMessages?.map(msg=>{
                      const isCurrentUserSender = msg.sender=== user._id;
                      const messageContainerStyles = {
                            ...(isCurrentUserSender ? {justifyContent:"end"} : {justifyContent:"start"}),
                            ...(isMobile ? { marginLeft: -20 } : {}) 
                            
                        };
                    return  <div className="message-container" style={messageContainerStyles}>
                   <div>
                       <div className={isCurrentUserSender?"send-message" :"received-message"}>
                            <div>{msg.text}</div>
                            <div>{msg?.image && <img src={msg.image} alt="image" height="120" width="120"/>}</div>
                        </div>
                        <div className='message-timestamp' style={isCurrentUserSender?{float:"right"}:{float:"left"}}>
                          {formatTime(msg.createdAt)}{isCurrentUserSender && <i className='fa fa-check-circle' aria-hidden="true" style={{color:'red',marginRight:'0px'}}></i>}{(isCurrentUserSender&& msg.read) && <i className='fa fa-check-circle' aria-hidden="true" style={{color:'green'}}></i>}
                        </div>
                   </div>
                  </div>
                  })}
                  <div className='typing-indicator'>{isTyping && selectedChat?.members.map(m=> m._id).includes(data?.sender)&& <i >typing...</i>}</div>
                </div>
                {showEmojiPicker && <div style={{width:'100%',display:'flex',padding:'0px 20px',justify:'right'}} className='emoji-picker'>
                  <EmojiPicker onEmojiClick={(e)=> setMessage(message+e.emoji)} style={{width:'300px',height:'400px'}} ></EmojiPicker></div>}
                
                <form onSubmit={sendMessage}>
                <div>
                 <div className="send-message-div">
                  {console.log(selectedChat.members.map(m => m._id))}
                        <input type="text" 
                            className="send-message-input" 
                            placeholder="Type Message Here"
                            value={message}
                            onChange={(e)=>
                                 {
                                  setMessage(e.target.value)
                                  socket.emit('user-typing',{
                                    chatId:selectedChat._id,
                                    members:selectedChat.members.map(m => m._id),
                                    sender:user._id,
                                  })
                                 }                       
                                }
                        />  
                     <label for="file">
                      <i className="fa fa-picture-o send-image-btn"></i>
                      <input
                         type='file'
                         id="file"
                         style={{display:'none'}}
                         accept='image/jpg,image/png,image/jpeg,image/gif'
                         onChange={sendImage}>
                         </input>

                      </label>   
                        <i 
                        className="fa fa-smile-o send-emoji-btn"
                        aria-hidden="true"
                        onClick={()=>{setShowEmojiPicker(!showEmojiPicker)}}
                        ></i>
                        <button 
                        className="fa fa-paper-plane send-message-btn"
                        aria-hidden="true"
                        type='submit'
                        ></button>
                    </div>
                  </div>
                </form>
              </div>
      }
    </>
  )
}

export default ChatArea;
