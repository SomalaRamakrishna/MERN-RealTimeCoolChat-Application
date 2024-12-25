import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { hideLoader, showLoader } from '../../redux/loaderSlice';
import toast from 'react-hot-toast';
import { setUser } from '../../redux/userSlice';

const Profile = ({user, onClose, updateProfilePic, onFileSelect, image ,setImage,isMobile}) => {
     const dispatch=useDispatch();
    useEffect(()=>{
       if(user?.profilePic){
        setImage(user.profilePic);
       } 
    },[user]) 



  const getFullname=()=>{
        let fname=user?.firstname.at(0).toUpperCase()+ user?.firstname.slice(1).toUpperCase();
        let lname=user?.lastname.at(0).toUpperCase()+ user?.lastname.slice(1).toUpperCase();
        return fname+' '+lname;
    }
    
    const getInitials=()=>{
        let f=user?.firstname.toUpperCase()[0];
        let l=user?.lastname.toUpperCase()[0];
        return f+l;
    }

    
  return (
     <div className="profile-overlay">
            <div className="profile-popup">
                 <button className="close-button" onClick={onClose}>
                    X
                </button>
                <div className="profile-page-container">
                    <div className="profile-pic-container">
                        {image && <img src={image} 
                            alt="Profile Pic" 
                            className="user-profile-pic-upload" 
                        />} 
                        {!image && <div className="user-default-profile-avatar">
                            {getInitials()}
                        </div>}
                    </div>

                    <div className="profile-info-container">
                        <div className="user-profile-name">
                            <h1>{getFullname()}</h1>
                        </div>
                        <div className='profile-email'>
                            <b>Email: </b> {user?.email}
                        </div>
                        <div className='profile-created'>
                            <b>Account Created: </b>{moment(user?.createdAt).format('MMM DD,YYYY')}
                        </div>{isMobile?<></>:<br/>}
                        <h4>Please {image===''?"Upload":"Update"} Your Profile</h4>
                        <div className="select-profile-pic-container">
                            <label htmlFor="file-upload" className="custom-file-upload">
                               Choose File
                            </label>
                            <input type="file" id="file-upload"  onChange={onFileSelect} className='file-upload' style={{display:"none"}}/>
                            <button className="upload-image-btn" onClick={()=>{updateProfilePic()}} >
                                {image===''?"Upload":"Update"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
     </div>
    
  )
}

export default Profile