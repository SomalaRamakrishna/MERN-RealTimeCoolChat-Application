import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import Profile from '../../profile';
import toast from 'react-hot-toast';
import { hideLoader, showLoader } from '../../../redux/loaderSlice';
import { setUser } from '../../../redux/userSlice';


const Header = ({socket,isMobile,isShow}) => {
    const {user}=useSelector(state => state.userReducer);
    const {allUsers}=useSelector(state => state.userReducer);
     const [showProfile, setShowProfile] = useState(false);
    const navigate=useNavigate();
    const dispatch=useDispatch();
    const [image,setImage]=useState('');
    //console.log("allUsers::",allUsers)
    // console.log("user :",user,"fullname",user.firstname)

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
     const handleProfileClick = () => {
        setShowProfile(true);
    };

    const handleCloseProfile = () => {
        setShowProfile(false);
    };
     const onFileSelect=async(e)=>{
        const file=e.target.files[0];
        const reader=new FileReader(file)//FileReader instance

        reader.readAsDataURL(file);
        reader.onloadend = async()=>{
            setImage(reader.result);
        }
    }
     const updateProfilePic=async()=>{
        console.log("called")
           try{
               dispatch(showLoader());
               const obj={
                   image,
                   userId:user._id,
               }
               const response=await fetch("http://localhost:5000/api/user/upload-profile-pic",{
                    method:"POST",
                   headers: {
                           Authorization: `Bearer ${localStorage.getItem('logInToken')}`,
                           'Content-Type': 'application/json' ,
                           },
                           body: JSON.stringify(obj) 
                       });
               
               console.log("res",response)
               const responseData=await response.json();
               console.log("resData",responseData)
               dispatch(hideLoader())
               if(response.ok){
                   toast.success(responseData.message);
                   dispatch(setUser(responseData.data));
               }else{
                   toast.error(responseData.message)
   
               }
   
   
           }
           catch(err){
               toast.error(err.message)
               console.log(err.message)
           }
       }

    const logoutHandler=()=>{
        localStorage.removeItem('logInToken');
        socket.emit('logout',user._id);
        navigate('/login')
    }
    
  return (
    <div className="app-header" style={(isMobile && isShow)?{display:"none"}:{}}>
                <div className="app-logo" >
                    Cool  {!isMobile?"Real Time":""} Chat
                     <i className="fa fa-star-o logo" aria-hidden="true"></i>
                </div>
                <div className="app-user-profile">
                  
                    {user?.profilePic && <img src={user?.profilePic} alt="profile-pic" className="logged-user-profile-pic" onClick={handleProfileClick}></img>}
                    {!user?.profilePic && <div className="logged-user-profile-pic" onClick={handleProfileClick}>{getInitials()}<i class="fa fa-pencil-square-o" aria-hidden="true" style={{paddingTop:"15px",marginLeft:"2px"}}></i></div>}
                         {showProfile && (
                <Profile user={user} onClose={handleCloseProfile} updateProfilePic={updateProfilePic} onFileSelect={onFileSelect} image={image} setImage={setImage} isMobile={isMobile}/>
            )}
                    <div className="logged-user-name">{getFullname()}</div>
                    <button className='logout-button' onClick={logoutHandler}>
                        <i className="fa fa-power-off logout"></i>
                    </button>
                    
                </div>
     </div>
  )
}

export default Header
