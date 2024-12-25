import React, { useEffect, useState } from 'react';
import { Navigate,useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import { useDispatch, useSelector } from 'react-redux';
import { hideLoader, showLoader } from '../redux/loaderSlice';
import { setAllChats, setAllUsers, setUser } from '../redux/userSlice';

const ProtectedRoute = ({ children }) => {
  
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const {user}=useSelector(state => state.userReducer);
  const dispatch=useDispatch();



  const getLoggedInUser = async () => {
    try {
      dispatch(showLoader());
      const response = await fetch("http://localhost:5000/api/user/get-logged-user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('logInToken')}`,
        },
      });
      dispatch(hideLoader());

      if (response.ok) {
        const loggedUser = await response.json();
       // toast.success("users fetched")
       // console.log(loggedUser.data)
        dispatch(setUser(loggedUser.data)); //dispatch will update user data to user
      } else {
        toast.error("response invalid")
        navigate('/login'); 
      }
    } catch (error) {
      dispatch(hideLoader());
      console.error("Error fetching user data:", error);
      navigate('/login'); 
    } finally {
      dispatch(hideLoader());
      setIsLoading(false); 
    }
  };

   const getAllUsers = async()=>{
    try {
      dispatch(showLoader());
      const response = await fetch("http://localhost:5000/api/user/get-all-users",{
        headers: {
          Authorization: `Bearer ${localStorage.getItem('logInToken')}`,
        },
      });
      dispatch(hideLoader());

      if (response.ok) {
        const Users = await response.json();
       // toast.success("all users fetched")
        //console.log("Users Data:",Users.data)
       dispatch(setAllUsers(Users.data)); //dispatch will update user data to user
      } else {
        toast.error("response invalid")
        navigate('/login'); 
      }
    } catch (error) {
      dispatch(hideLoader())
      navigate('/login');
    }
  } 

 const getCurrentUserChats = async()=>{
    try {
      dispatch(showLoader());
      const response = await fetch("http://localhost:5000/api/chat/get-all-chats",{
        headers: {
          Authorization: `Bearer ${localStorage.getItem('logInToken')}`,
        },
      });
      dispatch(hideLoader());

      if (response.ok) {
        const chats = await response.json();
       // toast.success("all Chats fetched")
        //console.log("Chats Data:",chats.data)
       dispatch(setAllChats(chats.data)); //dispatch will update user data to user
      } else {
        toast.error("response invalid")
        navigate('/login'); 
      }
    } catch (error) {
      dispatch(hideLoader())
      navigate('/login');
    }
  } 

 


  useEffect(() => {
    const token = localStorage.getItem('logInToken');
    if (!token) {
      navigate('/login');
    } else {
      getLoggedInUser();
      getAllUsers();
      getCurrentUserChats();
    }
  }, []);

  return (
    isLoading ? (
      <div>Loading...</div> // Display a loading indicator
    ) : (
      user ? (
        <>
          {children}
        </>
      ) : (
        <Navigate to="/login" />
      )
    )
  );
};

export default ProtectedRoute ;