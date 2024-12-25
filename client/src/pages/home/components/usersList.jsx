import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { hideLoader, showLoader } from '../../../redux/loaderSlice';
import toast from 'react-hot-toast';
import { setAllChats,setSelectedChat } from '../../../redux/userSlice';
import moment from 'moment';
import store from '../../../redux/store';



function  UsersList({searchKey,socket,onlineUsers,setIsShow,isMobile}){
    console.log("Online User",onlineUsers)
     const dispatch=useDispatch();
        const {allUsers,allChats ,user:currentUser,selectedChat} =useSelector(state => state.userReducer);
        //   console.log("allChats::",allChats,"allUsers",allUsers,"user",currentUser)

       const createNewChat= async(searchedUserId)=>{
               // console.log("searchuserId",searchedUserId);
            try {
               // useDispatch(showLoader());
               //  console.log("entered");
                const members=[currentUser?._id,searchedUserId];
                const response = await fetch("http://localhost:5000/api/chat/create-new-chat",{
                    method:"POST",
                    headers: {
                    Authorization: `Bearer ${localStorage.getItem('logInToken')}`,
                     'Content-Type': 'application/json' ,
                    },
                    body: JSON.stringify({ members: members }) 
                });
                //console.log("res",response);
                //dispatch(hideLoader());

                if (response.ok) {
                    const newChat = await response.json();
                    toast.success("Chat Created Successfully")
                    //console.log("newChats Data:",newChat)
                    const updatedChat = [...allChats,newChat.data]
                    dispatch(setAllChats(updatedChat)); //dispatch will update user data to user
                    dispatch(setSelectedChat(newChat.data));
                } else {
                    toast.error("Response Invalid,Please Try Again")
                }
                } catch (error) {
                //dispatch(hideLoader())
                toast.error("Internal Server Error");
                //console.log(error,error.message)
                }
            } 

        const openChat=(selectedUserId)=>{
               //console.log("selected Chat",selectedUserId)
               
            const chat = allChats.find(chat => 
            chat.members.map(m => m._id).includes(currentUser._id) && 
            chat.members.map(m => m._id).includes(selectedUserId)
        )               
            //console.log(chat);
            if(chat){
                dispatch(setSelectedChat(chat))
            }
            if(isMobile){
                setIsShow(true);
            }
        }

        const IsSelectedChat=(user)=>{
            if(selectedChat){
                return selectedChat.members.map(m=>m._id).includes(user._id) ;
            }
            return false;
        }
        const getLastMessageTimestamp=(userId)=>{
            const chat=allChats.find(chat=> chat.members.map(m => m._id).includes(userId))
           
            if(!chat &!chat?.lastMessage){
                return "";
            }
            else{
                return moment(chat?.lastMessage?.createdAt).format('hh:mm A');
            }
        }

        const getLastMessage = (userId)=>{
                const chat=allChats.find(chat=> chat.members.map(m => m._id).includes(userId))
               // console.log("get",chat?.lastMessage?.text);
                if(!chat || !chat?.lastMessage){
                    return "";
                }
                else{
                    const msgPrefix =chat?.lastMessage?.sender === currentUser._id ? "You : ":"";
                    const msgLengthMore=chat?.lastMessage?.text?.length>20?"...":"";
                    return msgPrefix + chat?.lastMessage?.text?.substring(0,20)+msgLengthMore;
                }
        } 

        const getUnreadMessageCount=(userId)=>{
            const chat=allChats.find(chat=> chat.members.map(m=>m._id).includes(userId));
            //console.log("count:",chat)
            if(chat && chat.unreadMessageCount && chat.lastMessage.sender !== currentUser._id){
                return (<div className='unread-message-counter'>{chat.unreadMessageCount}</div>);
            }
            else{
                return "";
            }
        }
        const formatName=(user)=>{
            let fname=user.firstname.at(0).toUpperCase()+ user.firstname.slice(1).toUpperCase();
            let lname=user.lastname.at(0).toUpperCase()+ user.lastname.slice(1).toUpperCase();
            return fname+' '+lname;
        }

        const getData=()=>{
            if(searchKey===""){
                return allChats;
            }else{
            return allUsers.filter(user =>{
                return user.firstname.toLowerCase().includes(searchKey.toLowerCase()) ||
                    user.lastname.toLowerCase().includes(searchKey.toLowerCase()); 
                });
            }
        }
   
        
        useEffect(()=>{
            getData();
            socket.off('set-message-count').on('set-message-count',(message)=>{
              const selectedChat=store.getState().userReducer.selectedChat; 
              let allChats=store.getState().userReducer.allChats;

              if(selectedChat?._id !== message.chatId){
                const updatedChats=allChats.map(chat =>{
                    if(chat._id === message.chatId){
                        return {
                            ...chat,
                            unreadMessageCount:(chat?.unreadMessageCount || 0)+1,
                            lastMessage:message
                        }
                    }
                    return chat;
                });
                allChats=updatedChats;
              }
              //to find latest chat
              const latestChat = allChats.find(chat=> chat._id === message.chatId);

              //to get all other chats
              const otherChats=allChats.filter(chat =>chat._id !== message.chatId);

              //create a new array latestes chat on top & other chats
              allChats=[latestChat,...otherChats];
              dispatch(setAllChats(allChats));
            })
        },[])

  return ( 
           getData()
           .map(obj =>{
            {console.log("executing")}
                let user=obj;
                if(obj.members){
                    user =obj.members.find(mem=> mem._id !== currentUser._id)
                }
                
            if((allChats.length>0) || searchKey!=="" ){
                {console.log("allChats",allChats)}
            return <div className="user-search-filter" onClick={()=>openChat(user._id)} key={user._id}>
                <div className={IsSelectedChat(user)?"selected-user":"filtered-user"}>
                    <div className="filter-user-display" >
                        {user.profilePic && <img src={user.profilePic} alt="Profile Pic" className='user-profile-image' style={onlineUsers.includes(user._id)?{outline:"red 3.5px solid"}:{} }/>}
                       {(!user.profilePic) && <div className={IsSelectedChat(user)?"user-selected-avatar":"user-default-avatar"} style={onlineUsers.includes(user._id)?{outline:"red 3.5px solid"}:{}}>
                            
                            {user.firstname.charAt(0).toUpperCase()
                                    +
                             user.lastname.charAt(0).toUpperCase()
                            }
                        </div>}
                        <div className='unread-message'>{getUnreadMessageCount(user._id)}</div>
                        <div className="filter-user-details">
                            <div className="user-display-name">{formatName(user)}</div>
                            <div className="user-display-email">
                                {getLastMessage(user._id) || (user.email.length > 15
                                    ? user.email.substring(0, 15) + "..."
                                    : user.email)}
                            </div>
                            <div className='notify'>                                
                                    <div className='last-message-timestamp'>{getLastMessageTimestamp(user._id)}</div>
                                     {getUnreadMessageCount(user._id)}
                            </div>

                             </div>{/* {console.log("jj",allChats.some(chat => chat.members.map(m=> m._id).includes(user._id)))} */}
                                 { !allChats.find(chat => chat.members.map(m => m._id).includes(user._id)) &&
                             ( <div className="user-start-chat" key={user._id}>
                                        <button className="user-start-chat-btn" onClick={()=>{createNewChat(user._id)}}> Start Chat</button>
                              </div>  )     
                          }           
                  </div>
                       
                </div>                        
            </div>
            }
            else{
                {console.log("entered")}
               return <div >
                <h3 style={{color:"red",fontFamily:"monospace",fontSize:"20px",padding:"10px"}}>Please Find Chats In Search</h3>                 
            </div>
            }
           })
        
    )
  
}

export default UsersList;