import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../../redux/loaderSlice";
/* import { loginUser } from './../../apiCalls/auth';

import { hideLoader, showLoader } from "../../redux/loaderSlice";
 */
const Login=()=>{
    const navigate=useNavigate()
    const dispatch =useDispatch();
    const [user, setUser] = React.useState({
        email: '',
        password: ''
    });

     useEffect(() => {
        const token = localStorage.getItem('logInToken');
        if (token) {
          navigate('/');
        }
      }, []);

   const onFormSubmit=async(event)=>{
        event.preventDefault();
               let data = null;
               //console.log("fetching...")
               try{
                   dispatch(showLoader())
                  const response = await fetch("http://localhost:5000/api/auth/login",{
                       method:"POST",
                       headers:{
                           'Content-Type':'application/json',
                       },
                       body:JSON.stringify(user)
                   });
                   dispatch(hideLoader());
                   // console.log("fetched")
                     data = await response.json(); 
                    //console.log(data);
                   if(response.ok){
                       toast.success("Welcome to Home Page");
                      // console.log(response)
                       localStorage.setItem("logInToken",data.token)
                       navigate('/');
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
            <h1>Login Here</h1>
        <p>Cool Chat Welcomes U !</p>
        </div>
        <div className="form">
        <form onSubmit={ onFormSubmit }>
            <input type="email" placeholder="Email"
            value={user.email}
            onChange={ (e) => setUser({...user, email: e.target.value})} 
            required className="user-email" />
           
                
            <input type="password" placeholder="Password"
            value={user.password}
            onChange={ (e) => setUser({...user, password: e.target.value})} required className="user-password" />
            
            <button type="submit">Login</button>
        </form>
        </div>
        <div className="user-guide-text"> 
            <span>If you don't have an account yet?
                <Link to="/signup">Register Here</Link>
            </span>
        </div>
        </div>
    </div>
    )
}

export default Login;