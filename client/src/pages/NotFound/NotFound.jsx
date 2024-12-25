import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div>
      <h1 style={{color:"red"}}>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
       <Link to="/">Go Home</Link> 
    </div>
  );
};

export default NotFound;