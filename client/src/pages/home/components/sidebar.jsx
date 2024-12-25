import React, { useState } from 'react'
import Search from './search';
import UsersList from './usersList';

const Sidebar = ({socket,onlineUsers,setIsShow,isMobile}) => {
    const [searchKey,setSearchKey]=useState('');
  return (
    <div className='app-sidebar'>
        <Search 
            searchKey={searchKey} 
            setSearchKey={setSearchKey}>
        </Search> 
        <div className='users-list'>
          <UsersList 
            searchKey={searchKey} 
            socket={socket}
            onlineUsers={onlineUsers}
            setIsShow={setIsShow} isMobile={isMobile}
         ></UsersList>
        </div>
    </div>
  )
}

export default Sidebar;
