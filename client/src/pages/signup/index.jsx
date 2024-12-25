import React from "react";
import { Link, useNavigate } from "react-router-dom";
//import axios from "axios";
//import { signupUser } from '../../../../server/controllers/authController'
import { toast } from 'react-hot-toast';
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../../redux/loaderSlice";
//import { showLoader, hideLoader } from "../../redux/loaderSlice";

const Signup=()=>{
    const navigate=useNavigate();
     const dispatch=useDispatch();
    const [user, setUser] = React.useState({
        firstname: '',
        lastname: '',
        email: '',
        password: ''
    });
    
    const  onFormSubmit=async(event)=>{
        event.preventDefault();
        let response = null;
        console.log("fetching...")
        let data=null;
        try{
            dispatch(showLoader());
            response = await fetch("http://localhost:5000/api/auth/signup",{
                method:"POST",
                headers:{
                    'Content-Type':'application/json',
                },
                body:JSON.stringify(user)
            });
            dispatch(hideLoader())
             data=await response.json()
            // console.log("fetched")
            if(response.ok){
                toast.success("Successfully User Registered ");
               navigate('/login');
            }else{
                toast.error(data.message);
            }
        }catch(err){
            dispatch(hideLoader());
            toast.error(data.message);
        }
    }
    
    return (
        <div className="container">
        <div className="container-back-img"></div>
        <div className="container-back-color"></div>
        <div className="card">
            <div className="card-title">
                
                <h1>Create Account </h1>
            </div>
            <div className="form">
                <form onSubmit={ onFormSubmit }>
                    <div className="column">
                        <input type="text" placeholder="First Name" 
                            value={user.firstname} 
                            onChange={(e) => setUser({...user, firstname: e.target.value})} className="user-email" />
                        <input type="text" placeholder="Last Name" 
                            value={user.lastname}
                            onChange={(e) => setUser({...user, lastname: e.target.value})} className="user-email"/>
                    </div>
                    <input type="email" placeholder="Email" 
                        value={ user.email }
                        onChange={(e) => setUser({...user, email: e.target.value})} className="user-email"/>
                    <input type="password" placeholder="Password" 
                        value={ user.password }
                         onChange={(e) => setUser({...user, password: e.target.value})} className="user-email"/>
                    <button type="submit">Register</button>
                </form>
            </div>
            <div className="user-guide-text">
                <span>If you already have an account?
                    <Link to="/login">Login Here</Link>
                </span>
            </div>
        </div>
    </div>
    )
}

export default Signup;