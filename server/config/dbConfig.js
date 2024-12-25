const mongoose=require('mongoose')
const mongoose2=require('mongoose')

mongoose2.connect(process.env.MONGODB_URI)

//connection state
 
//mongoose2.connection.close();
const db=mongoose2.connection;

db.on('connected',()=>{
    console.log('DB Connection Successfull')
})

db.on('error',()=>{
    console.log('DB Connection failed !');
})


module.exports=db;